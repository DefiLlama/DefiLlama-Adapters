const SUNNY_POOLS = require("./helper/sunny-pools.json");

const { getMultipleAccountBuffers } = require("./helper/solana");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function genericSunnySaberPoolReader(sunnyPoolOffset) {
  return async (pool) => {
    const accountData = await getMultipleAccountBuffers(pool.relevantAccounts);
    if (accountData.sunnyPool === null) {
      return {};
    }

    const decimals = accountData.tokenAMint.readUInt8(44);

    const lpTokensInSunnyPool =
      Number(accountData.sunnyPool.readBigUInt64LE(sunnyPoolOffset)) /
      10 ** decimals;
    const reserveAAmount =
      Number(accountData.tokenAReserve.readBigUInt64LE(64)) / 10 ** decimals;
    const reserveBAmount =
      Number(accountData.tokenBReserve.readBigUInt64LE(64)) / 10 ** decimals;
    const lpTokenTotalSupply =
      Number(accountData.lpTokenSPL.readBigUInt64LE(36)) / 10 ** decimals;

    const sunnysShareOfSaber = lpTokensInSunnyPool / lpTokenTotalSupply;

    const poolTvlCoins = {};

    if (pool.tokenA === pool.tokenB) {
      poolTvlCoins[pool.tokenA] =
        sunnysShareOfSaber * reserveAAmount +
        sunnysShareOfSaber * reserveBAmount;
    } else {
      poolTvlCoins[pool.tokenA] = sunnysShareOfSaber * reserveAAmount;
      poolTvlCoins[pool.tokenB] = sunnysShareOfSaber * reserveBAmount;
    }

    return poolTvlCoins;
  };
}

const tvlReaders = {
  sunnySaberPoolReader: genericSunnySaberPoolReader(209),
  sunnyQuarrySaberPoolReader: genericSunnySaberPoolReader(297),
};

async function tvl() {
  tvlReaders;

  // a mapping of coin name to coin amount
  const tvlResult = {};

  // Run these serially to avoid rate limiting issues
  for (const pool of SUNNY_POOLS) {
    const poolTVL = await tvlReaders[pool.tvlReader](pool);
    console.log(pool.poolName, poolTVL);
    await sleep(1200);

    for (const [tokenId, amount] of Object.entries(poolTVL)) {
      if (!tvlResult[tokenId]) {
        tvlResult[tokenId] = amount;
      } else {
        tvlResult[tokenId] += amount;
      }
    }
  }

  return tvlResult;
}

module.exports = {
  methodology:
    'TVL counts LP token deposits made to Sunny Aggregator. CoinGecko is used to find the price of tokens in USD, only the original "SOL" token price is used for all existing variations of the token.',
  tvl,
};
