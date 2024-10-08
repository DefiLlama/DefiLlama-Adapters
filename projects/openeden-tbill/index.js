const { getCache, } = require("../helper/cache");
const ADDRESSES = require('../helper/coreAssets.json')

const tbill = "0xdd50C053C096CB04A3e3362E2b622529EC5f2e8a"

function getTimeNow() {
  return Math.floor(Date.now() / 1000);
}

async function tvl(api) {
  let contract = tbill
  if (api.chain === 'arbitrum') contract = '0xF84D28A8D28292842dD73D1c5F99476A80b6666A'
  const [bal, token] = await api.batchCall([
    { abi: 'uint256:totalAssets', target: contract },
    { abi: 'address:underlying', target: contract },
  ])
  api.add(token, bal)
}

async function ripplTvl (api) {
  const timeNow = getTimeNow()
  const aDayInSeconds = 60 * 60 * 24;
  const projectKey = 'openeden-tbill'
  const cacheKey = 'cache'
  let { lastDataUpdate, tvl } = await getCache(projectKey, cacheKey)
  if (!lastDataUpdate || timeNow - lastDataUpdate > aDayInSeconds || !tvl) 
    throw new Error("stale/missing tvl data");
  api.add(tbill, tvl * 10 ** 6, { skipChain: true })
}

module.exports = {
  ethereum: { tvl },
  arbitrum: { tvl },
  ripple: { tvl: ripplTvl }
}