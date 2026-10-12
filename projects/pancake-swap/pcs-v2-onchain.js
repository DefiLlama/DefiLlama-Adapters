const { get } = require('../helper/http')
const { getUniTVL } = require('../helper/unknownTokens')

// same data as the TVL chart on https://pancakeswap.finance/info
const INFO_TVL_URL = 'https://explorer.pancakeswap.com/api/cached/protocol/chart/v2/bsc/tvl?groupBy=1D'
const MAX_AGE = 2 * 24 * 3600

async function infoTvl(api) {
  const data = await get(INFO_TVL_URL)
  const latest = data.at(-1)
  const age = api.timestamp - Date.parse(latest.bucket) / 1e3
  if (!(+latest.tvlUSD > 0) || age > MAX_AGE) throw new Error(`stale or empty pancakeswap info tvl: ${JSON.stringify(latest)}`)
  api.addUSDValue(+latest.tvlUSD)
}

async function onchainTvl(api) {
  if (!process.env.PCS_PULL)
    throw new Error("PCS_PULL environment variable not set. Please set it to 'true' to enable TVL calculation.")
  const tvlFunction = getUniTVL({ factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73', useDefaultCoreAssets: true, skipUnknownTokens: true, waitBetweenCalls: 5000, queryBatched: 10000, memoryOptimization: true, })
  return tvlFunction(api)
}

module.exports = {
  bsc: {
    tvl: async (api) => {
      try {
        return await infoTvl(api)
      } catch (e) {
        throw e
        console.error('pancakeswap info tvl failed, falling back to on-chain:', e.message)
        return onchainTvl(api)
      }
    }
  },
}
