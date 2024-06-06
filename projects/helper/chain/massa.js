const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const axios = require("axios");

const {
  Client,
  ProviderType,
  strToBytes,
  Args,
  CHAIN_ID,
} = require("@massalabs/massa-web3");

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

const u8ArrayToString = (array) => String.fromCharCode(...array);
class ILBPair {
  address;
  client;
  constructor(address, client) {
    this.address = address;
    this.client = client;
  }
  getReserves() {
    return baseClient
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: "getPairInformation",
        parameter: new Args(),
      })
      .then((res) => {
        const args = new Args(res.returnValue);
        const reserveX = args.nextU256();
        const reserveY = args.nextU256();
        return { reserveX, reserveY };
      })
      .catch((e) => {
        console.error("error", e);
        return { reserveX: 0, reserveY: 0 };
      });
  }
}
// function parseBigintIsh(bigintIsh) {
//   return typeof bigintIsh === 'bigint' ? bigintIsh : BigInt(bigintIsh)
// }
// class Fraction {
//   numerator;
//   denominator;
//   constructor(numerator, denominator) {
//     this.numerator = parseBigintIsh(numerator);
//     this.denominator = parseBigintIsh(denominator);
//   }
//   add(fraction) {
//     const numerator = this.numerator * fraction.denominator + fraction.numerator * this.denominator;
//     const denominator = this.denominator * fraction.denominator;
//     return new Fraction(numerator, denominator);
//   }
//   multiply(fraction) {
//     const numerator = this.numerator * fraction.numerator;
//     const denominator = this.denominator * fraction.denominator;
//     return new Fraction(numerator, denominator);
//   }
  
//   toFixed() {
//     return this.numerator / this.denominator;
//   }

// }
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

//TODO : fetch coingecko:massa-bridged-dai-massa"
//TODO : fetch coigecko:massa-bridged-usdc-massa
//TODO : fetch coingecko:massa
//TODO : fetch coingecko:wrapped-ether-massa
//TODO : fetch coingecko:wrapped-massa

const fetchTokensInfo = async (tokenX, tokenY) => {
  return baseClient
    .publicApi()
    .getDatastoreEntries([
      {
        address: tokenX,
        key: strToBytes("NAME"),
      },
      {
        address: tokenX,
        key: strToBytes("SYMBOL"),
      },
      {
        address: tokenY,
        key: strToBytes("NAME"),
      },
      {
        address: tokenY,
        key: strToBytes("SYMBOL"),
      },
    ])
    .then((res) => {
      if (!res[0].candidate_value || !res[1].candidate_value)
        throw new Error("No token info found");
      let nameY = u8ArrayToString(res[0].candidate_value);
      let symbolY = u8ArrayToString(res[1].candidate_value);
      let nameX = u8ArrayToString(res[2].candidate_value);
      let symbolX = u8ArrayToString(res[3].candidate_value);
      return { nameX, symbolX, nameY, symbolY };
    });
};

const fetchPairInformation = async (poolAddress) => {
  return await new ILBPair(poolAddress, baseClient).getReserves();
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

      const { reserveX, reserveY } = await fetchPairInformation(pool);
      const { symbolX, symbolY } = tokensInfo || {};

      return {
        tokenX: tokens[0],
        reserveX,
        symbolX,
        tokenY: tokens[1],
        reserveY,
        symbolY,
      };
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
//pourquoi on a besoin de le mettre en fraction ? 
// const toFraction = async (priceToken) => {
//   return new Fraction(priceToken, BigInt(1e18));
// }

const fetchTVL = async (factoryAddress) => {
    const pools = await poolsInformation(factoryAddress);
    const symbolAndPricesArray = await symbolAndPrices(pools);
  
    let tvl = BigInt(0);
  
    for (const pool of pools) {
      const priceX = (BigInt(Math.round((symbolAndPricesArray.find(item => item.symbol === pool.symbolX)?.price || 1) * 1e18))) ;
      const priceY = (BigInt(Math.round((symbolAndPricesArray.find(item => item.symbol === pool.symbolY)?.price || 1) * 1e18)));

      const reserveX = BigInt(pool.reserveX);
      const reserveY = BigInt(pool.reserveY);

      tvl +=  reserveX * priceX + reserveY * priceY;
    }
    
    const tvlInOriginalScale = Number(tvl.toString().slice(0,6));
  
    console.log(tvlInOriginalScale.toLocaleString());
    return tvlInOriginalScale;
  };

async function main() {
  const pools = await fetchTVL(factoryAddress.massa);
    console.log(pools);
}

main().catch(console.error);

module.exports = {
  RPC_ENDPOINT,
  getPairAddress,
  fetchTVL,
  baseClient,
  fetchPairInformation,
  getPairAddressTokens,
};

