const axios = require("axios");

const {
  Client,
  ProviderType,
  strToBytes,
  Args,
} = require("@massalabs/massa-web3");

const {
  TokenAmount, 
  Token, 
  Fraction
} = require("@dusalabs/sdk");

const RPC_ENDPOINT = "https://mainnet.massa.net/api/v2";

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
    activeId: args.nextU32(),
    reserveX: args.nextU256(),
    reserveY: args.nextU256(),
    feesX: args.nextU256(),
    feesY: args.nextU256(),
    oracleSampleLifetime: args.nextU32(),
    oracleSize: args.nextU32(),
    oracleActiveSize: args.nextU32(),
    oracleLastTimestamp: args.nextU32(),
    oracleId: args.nextU32(),
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

const getDatastoreEntries = async (tokenAddress) => {
  return baseClient
    .publicApi()
    .getDatastoreEntries([
      {
        address: tokenAddress,
        key: strToBytes("DECIMALS"),
      },
    ])
    .then((res) => {
      if (!res[0].candidate_value) throw new Error("No token info found");
      return res[0].candidate_value;
    });

}

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
        tokensInfo = await fetchTokensInfo(tokens[1], tokens[0]);
        const decimalsX = await getDatastoreEntries(tokens[0]);
        const decimalsY = await getDatastoreEntries(tokens[1]);

        tokensInfo = {
          ...tokensInfo,
          decimalsX: Number(decimalsX),
          decimalsY: Number(decimalsY),
        };
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
const toFraction = (price) => {
  const value = BigInt(Math.round((price || 1) * 1e18));
  return new Fraction(value, BigInt(1e18));
};

const roundFraction = (amount, precision = 6) =>
  Number(amount.toSignificant(precision));

const fetchTVL = async (poolInfo, prices) => {

  const symbolAndPricesArray = prices;
  const priceX = symbolAndPricesArray.find(
      (item) => item.symbol === poolInfo.symbolX
    )?.price;
  const priceY = symbolAndPricesArray.find(
      (item) => item.symbol === poolInfo.symbolY
    )?.price;
  
  if (priceX === 0 || priceY === 0) {
    return 0;
  }
  
  const reserveX = poolInfo.reserveX;
  const reserveY = poolInfo.reserveY;

  const tokenX = new Token('', '', poolInfo.decimalsX, poolInfo.symbolX, '');
  const tokenY = new Token('', '', poolInfo.decimalsY,poolInfo.symbolY, '');

  const amount0 = new TokenAmount(tokenX, reserveX);
  const amount1 = new TokenAmount(tokenY, reserveY);


  // 1rst method
  // const tvl = 
  // roundFraction(amount0
  //   .multiply(toFraction(priceX))
  //   .add(amount1.multiply(toFraction(priceY))));

  // 2nd method
  const tvl = amount0.multiply(toFraction(priceX)).add(amount1.multiply(toFraction(priceY)));
  
  return Number(tvl.toSignificant(6));

  
  // return tvl;
}


// async function main() {
//   const tokenSymbolPool = await poolsInformation(factoryAddress.massa);
//   const symbolAndPricesArray = await symbolAndPrices(tokenSymbolPool);

//   const poolAddresses = await getPairAddress(factoryAddress.massa);


//   if (poolAddresses[0].startsWith(":")) {
//     poolAddresses[0] = poolAddresses[0].substring(1);
//   }
//   const pools = poolAddresses[0].split(":");

//   let i = 0;
//   let tvl = 0;
//   for (const pool of pools) {
//     const info = await getPairInformation(pool);
//     let poolInfo = await decodePairInformation(info);
//     console.log("pool", pool);
//     poolInfo = {
//       reserveX: Number(poolInfo.reserveX),
//       reserveY: Number(poolInfo.reserveY),
//       symbolX: tokenSymbolPool[i].symbolX,
//       symbolY: tokenSymbolPool[i].symbolY,
//       decimalsX: tokenSymbolPool[i].decimalsX,
//       decimalsY: tokenSymbolPool[i].decimalsY,
//     };
//     const tvlInPool = await fetchTVL(poolInfo, symbolAndPricesArray);

  
//     tvl += (tvlInPool); 
//     console.log('tvl', tvl);
//     i += 1;
//   }
//   console.log('tvl.toLocaleString()', tvl.toLocaleString());
// }


module.exports = {
  fetchTVL, 
  poolsInformation,
  symbolAndPrices,
  getPairAddress, 
  decodePairInformation,
  getPairInformation
};
