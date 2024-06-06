
const { sumTokensExport } = require('../helper/sumTokens')
const factory = '0x1c0a36e26a8f822e0d81f20a5a562b16a8f8a3dfd99801367dd2aea8f1a87a2'
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  timetravel: false,
  starknet: {
    tvl: sumTokensExport({ owner: '0x0568c49d2ac0f614b69f675250df807c7baa62ef2ab77c4dd101be194f79c314', tokens: [ADDRESSES.starknet.ETH]}),
  }
}