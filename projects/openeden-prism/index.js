const { get } = require("../helper/http")

async function ethTVL(api) {
  const data = await get('https://prod-gw.openeden.com/prism/sys/reserve-composition-last')
  api.addUSDValue(data.reserveAssetsInUsd)
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ethereum: { tvl: ethTVL },
}
