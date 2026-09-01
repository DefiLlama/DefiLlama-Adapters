
const { dexExport } = require('../helper/chain/starknet')
const factory = '0x1c0a36e26a8f822e0d81f20a5a562b16a8f8a3dfd99801367dd2aea8f1a87a2'

module.exports = {
  timetravel: false,
  starknet: {
    tvl: dexExport({ factory, }),
  }
}