const { get } = require('../helper/http.js')
// const { getUniTVL } = require('../helper/unknownTokens.js')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  tron: {
    // tvl: getUniTVL({ factory: 'TKWJdrQkqHisa1X8HUdHEfREvTzw4pMAaY', useDefaultCoreAssets: true, queryBatched: 11 }),
    tvl: httpTvl,
  }
}



async function httpTvl(api) {
  const { data } = await get('https://pabc.endjgfsv.link/swapv2/scan/getAllLiquidityVolume')
  const latest = data.pop()
  const timestamp = Date.now() - 24 * 60 * 60 * 1000

  if (latest.time * 1000 > timestamp) {
    api.addUSDValue(+latest.liquidity)
  } else {
    throw new Error("No recent data found")
  }
}