const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const axios = require("axios");

const {
  Client,
  ProviderType,
  strToBytes,
  Args,
} = require("@massalabs/massa-web3");
const { decode } = require("@project-serum/anchor/dist/cjs/utils/bytes/hex");

const RPC_ENDPOINT = "https://mainnet.massa.net/api/v2";
const factoryAddress = {
  massa: "AS1rahehbQkvtynTomfoeLmwRgymJYgktGv5xd1jybRtiJMdu8XX",
};
const idGecko = {
  WMAS: "wrapped-massa",
  "USDC.e": "massa-bridged-usdc-massa",
  "DAI.e": "massa-bridged-dai-massa",
  "WETH.e": "wrapped-ether-massa",
  MASSA: "massa",
};

const providers = [
  { url: RPC_ENDPOINT, type: ProviderType.PUBLIC },
  { url: RPC_ENDPOINT, type: ProviderType.PRIVATE },
];
const baseClient = new Client({
  providers,
  retryStrategyOn: false,
});

function u8ArrayToString(array) {
  let str = "";
  for (const byte of array) {
    str += String.fromCharCode(byte);
  }
  return str;
}

const decodePairInformation = async (bs) => {
  const args = new Args(bs);
  return {
    reserveX: args.nextU256(),
    reserveY: args.nextU256(),
  };
};

function coinGeckoURL(ids) {
  return `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_last_updated_at=true`;
}

const getPairAddress = async (factoryAddress) => {
  if (!factoryAddress) {
    throw new Error("factoryAddress is undefined");
  }
  return await baseClient
    .publicApi()
    .getDatastoreEntries([
      {
        address: factoryAddress,
        key: strToBytes("ALL_PAIRS"),
      },
    ])
    .then((r) => {
      if (r[0].candidate_value && r[0].final_value)
        return [u8ArrayToString(r[0].candidate_value)];
      return [];
    })
    .catch((e) => {
      console.error("error", e);
      return [""];
    });
};
const getPairInformation = async (poolAddress) => {
  if (!poolAddress) {
    throw new Error("factoryAddress is undefined");
  }
  return await baseClient
    .publicApi()
    .getDatastoreEntries([
      {
        address: poolAddress,
        key: strToBytes("PAIR_INFORMATION"),
      },
    ])
    .then((r) => {
      if (r[0].candidate_value && r[0].final_value) return r[0].candidate_value;
      return [];
    })
    .catch((e) => {
      console.error("error", e);
      return [""];
    });
};

const getPairAddressTokens = async (poolAddress) => {
  return baseClient
    .publicApi()
    .getDatastoreEntries([
      {
        address: poolAddress,
        key: strToBytes("TOKEN_X"),
      },

      {
        address: poolAddress,
        key: strToBytes("TOKEN_Y"),
      },
    ])
    .then((r) => {
      if (r[0].candidate_value && r[1].candidate_value) {
        return [
          u8ArrayToString(r[0].candidate_value),
          u8ArrayToString(r[1].candidate_value),
        ];
      } else {
        console.error("error in getPairAddressTokens", r);
        return [];
      }
    })
    .catch((e) => {
      console.error("error", e);
      return [""];
    });
};

const fetchTokensInfo = async (tokenX, tokenY) => {
  return baseClient
    .publicApi()
    .getDatastoreEntries([
      {
        address: tokenX,
        key: strToBytes("SYMBOL"),
      },
      {
        address: tokenY,
        key: strToBytes("SYMBOL"),
      },
    ])
    .then((res) => {
      if (!res[0].candidate_value || !res[1].candidate_value)
        throw new Error("No token info found");
      let symbolY = u8ArrayToString(res[0].candidate_value);
      let symbolX = u8ArrayToString(res[1].candidate_value);
      return { symbolX, symbolY };
    });
};

const poolsInformation = async (factoryAddress) => {
  const poolAddresses = await getPairAddress(factoryAddress);
  if (poolAddresses[0].startsWith(":")) {
    poolAddresses[0] = poolAddresses[0].substring(1);
  }

  const pools = poolAddresses[0].split(":");
  const results = await Promise.all(
    pools.map(async (pool) => {
      const tokens = await getPairAddressTokens(pool);
      let tokensInfo;
      if (tokens[0] && tokens[1]) {
        tokensInfo = await fetchTokensInfo(tokens[0], tokens[1]);
      }
      return tokensInfo;
    })
  );
  return results;
};

const fetchUSDPrice = async (ids) => {
  if (ids === undefined) {
    return 0;
  } else {
    const response = await axios.get(coinGeckoURL(ids));
    return response.data[ids].usd;
  }
};

const symbolAndPrices = async (pools) => {
  const symbolAndPrices = new Set();

  pools.forEach(({ symbolX, symbolY }) => {
    symbolAndPrices.add(symbolX);
    symbolAndPrices.add(symbolY);
  });

  const symbolAndPricesArray = Array.from(symbolAndPrices);
  for (let i = 0; i < symbolAndPricesArray.length; i++) {
    const price = await fetchUSDPrice(idGecko[symbolAndPricesArray[i]]);
    symbolAndPricesArray[i] = { symbol: symbolAndPricesArray[i], price };
  }
  return symbolAndPricesArray;
};

const fetchTVL = async (pools) => {
  console.log("pools = lists daddresse de la pool ", pools);
  const symbolAndPricesArray = await symbolAndPrices(pools);
  let tvl = BigInt(0);

  for (const pool of pools) {
    const priceX = BigInt(
      Math.round(
        (symbolAndPricesArray.find((item) => item.symbol === pool.symbolX)
          ?.price || 1) * 1e18
      )
    );
    const priceY = BigInt(
      Math.round(
        (symbolAndPricesArray.find((item) => item.symbol === pool.symbolY)
          ?.price || 1) * 1e18
      )
    );

    const valueX = (pool.reserveX * priceX) / BigInt(1e18);
    const valueY = (pool.reserveY * priceY) / BigInt(1e18);

    tvl += valueX + valueY;
  }

  const tvlInOriginalScale = Number(tvl.toString().slice(0, 6));

  console.log(tvlInOriginalScale.toLocaleString());
  return tvlInOriginalScale;
};

async function main() {
  const tokenSymbolPool = await poolsInformation(factoryAddress.massa);
  const symbolAndPricesArray = await symbolAndPrices(tokenSymbolPool);

  const poolAddresses = await getPairAddress(factoryAddress.massa);
  if (poolAddresses[0].startsWith(":")) {
    poolAddresses[0] = poolAddresses[0].substring(1);
  }
  const pools = poolAddresses[0].split(":");
  let i = 0;
  let tvl = BigInt(0);
  // pour chaque pool
  for (const pool of pools) {
    const info = await getPairInformation(pool);
    let poolInfo = await decodePairInformation(info);
    poolInfo = {
      ...poolInfo,
      symbolX: tokenSymbolPool[i].symbolX,
      symbolY: tokenSymbolPool[i].symbolY,
    };

    //TO DO : finish the function to fetch the TVL with the right conversion type
    const priceX =
      symbolAndPricesArray.find((item) => item.symbol === poolInfo.symbolX)
        ?.price ;
    const priceY =
      symbolAndPricesArray.find((item) => item.symbol === poolInfo.symbolY)
        ?.price ;
    console.log('priceX', priceX, 'priceY', priceY, 'poolInfo.reserveX', poolInfo.reserveX, 'poolInfo.reserveY', poolInfo.reserveY);

        i += 1;
  }
}

main().catch(console.error);

module.exports = {
  getPairAddress,
  fetchTVL,
  baseClient,
  getPairAddressTokens,
};
