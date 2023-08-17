const { getUniTVL } = require('../helper/unknownTokens.js')

process.env.TRON_RPC="https://rpc.ankr.com/http/tron/wallet/triggerconstantcontract"

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  tron: {
    tvl: getUniTVL({ factory: 'TKWJdrQkqHisa1X8HUdHEfREvTzw4pMAaY', useDefaultCoreAssets: true, queryBatched: 11 }),
  }
}
