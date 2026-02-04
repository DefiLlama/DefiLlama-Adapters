const { get } = require('./helper/http');
const ADDRESSES = require('./helper/coreAssets.json')

const ADA = ADDRESSES.cardano.ADA

async function tvl(api) {
  let { tvlAda } = await get('https://analytics.splash.trade/platform-api/v1/platform/stats')
  api.add(ADA, tvlAda)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  cardano: { tvl }
}
