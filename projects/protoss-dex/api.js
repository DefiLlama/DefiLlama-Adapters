const { dexExport } = require('../helper/chain/starknet')
const factory = '0x04bd9ec70e3ee64fe0adefe0ae4eff797fe07b6fe19d72438db0b6d336ee77c8'

module.exports = {
  timetravel: false,
  starknet: {
    tvl: dexExport({ factory, }),
  }
}
