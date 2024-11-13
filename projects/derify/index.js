const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')

module.exports = {
  bsc: {
    tvl: staking('0x75777494496f6250DdB9A1B96a6203e219d3698f', ADDRESSES.bsc.BUSD)
  }
}
