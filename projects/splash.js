const { get } = require('./helper/http');
const ADDRESSES = require('./helper/coreAssets.json')

async function cardanoTVL(api) {
  const { tvlAda } = await get('https://api2.splash.trade/platform-api/v1/platform/stats')
  api.add(ADDRESSES.cardano.ADA, tvlAda)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  cardano: {
    tvl: cardanoTVL,
  }
}
