const { get } = require('../helper/http.js')
const { getUniTVL } = require('../helper/unknownTokens.js')

const onChainTvl = getUniTVL({ factory: 'TKWJdrQkqHisa1X8HUdHEfREvTzw4pMAaY', useDefaultCoreAssets: true, queryBatched: 11 })

const API_LAG_SECONDS = 24 * 3600
const URL = 'https://pabc.endjgfsv.link/swapv2/scan/getAllLiquidityVolume'

async function httpTvl(api) {
  try {
    // SunSwap's API publishes one snapshot per day with a >24h lag (Pattern from projects/anyhedge/index.js)
    const target = api.timestamp ?? Math.floor(Date.now() / 1000)
    const cutoff = Math.floor(Date.now() / 1000) - API_LAG_SECONDS
    if (target > cutoff) throw new Error('SunSwap TVL not yet available — awaiting next daily snapshot')

    const { data } = await get(URL)
    if (!data?.length) throw new Error('SunSwap API returned no snapshots')
    
    const match = data
      .filter(p => Math.abs(p.time - target) <= API_LAG_SECONDS)
      .reduce((best, p) => (!best || p.time > best.time ? p : best), null)
    if (!match) throw new Error(`No SunSwap snapshot within 24h of ${target}`)

    api.addUSDValue(+match.liquidity)
  } catch (e) {
    console.error("Error fetching TVL from API, falling back to on-chain data:", e)
    await onChainTvl(api)
  }

  return api.getBalances()
}

module.exports = {
  misrepresentedTokens: true,
  tron: { tvl: httpTvl }
}
