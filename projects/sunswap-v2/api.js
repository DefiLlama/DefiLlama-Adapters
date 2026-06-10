const { get } = require('../helper/http.js')
const { getUniTVL } = require('../helper/unknownTokens.js')

const onChainTvl = getUniTVL({ factory: 'TKWJdrQkqHisa1X8HUdHEfREvTzw4pMAaY', useDefaultCoreAssets: true, queryBatched: 11 })

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  tron: {
    // tvl: onChainTvl,
    tvl: httpTvl,
  }
}



async function httpTvl(api) {
  try {

    const { data } = await get('https://pabc.endjgfsv.link/swapv2/scan/getAllLiquidityVolume')
    const latest = data.pop()
    // the API publishes one liquidity snapshot per day and trails ~1 day, so the
    // latest point is normally 24-48h old; only fall back to on-chain when it is
    // genuinely stale (source frozen)
    const maxStaleness = 3 * 24 * 60 * 60 * 1000

    if (latest.time * 1000 > Date.now() - maxStaleness) {
      api.addUSDValue(+latest.liquidity)
    } else {
      throw new Error("No recent data found")
    }
  } catch (e) {
    console.error("Error fetching TVL from API, falling back to on-chain data:", e)
    await onChainTvl(api)
  }

  return api.getBalances()
}