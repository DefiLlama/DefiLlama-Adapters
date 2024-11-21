const ADDRESSES = require('../helper/coreAssets.json')
const { getCache, } = require("../helper/cache");


module.exports = {
  methodology: "Finds all AMM pools on XRPL, checks their reserves, calculates TVL (in XRP) for each pool and sums them up.",
  ripple: { tvl },
  misrepresentedTokens: true,
};

function getTimeNow() {
  return Math.floor(Date.now() / 1000);
}

async function tvl(api) {
  const timeNow = getTimeNow()
  const aDayInSeconds = 60 * 60 * 24;
  const projectKey = 'xrpl-dex'
  const cacheKey = 'cache'
  let { lastDataUpdate, tvl } = await getCache(projectKey, cacheKey)
  const val = tvl?.XRP
  if (!lastDataUpdate || timeNow - lastDataUpdate > aDayInSeconds || !val) 
    throw new Error("stale/missing tvl data");
  api.addCGToken('ripple', val/1e6)
}