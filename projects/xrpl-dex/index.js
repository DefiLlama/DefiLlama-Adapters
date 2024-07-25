const { getCache, } = require("../helper/cache");


module.exports = {
  methodology:
    "Finds all AMM pools on XRPL, checks their reserves, calculates TVL (in XRP) for each pool and sums them up.",
  ripple: {
    tvl,
  },
  misrepresentedTokens: true,
};

function getTimeNow() {
  return Math.floor(Date.now() / 1000);
}

async function tvl() {
  const timeNow = getTimeNow()
  const aDayInSeconds = 60 * 60 * 24;
  const projectKey = 'xrpl-dex'
  const cacheKey = 'cache'
  let { lastDataUpdate, tvl } = await getCache(projectKey, cacheKey)
  if (!lastDataUpdate || timeNow - lastDataUpdate > aDayInSeconds) 
    throw new Error("stale/missing tvl data");
  return tvl
}