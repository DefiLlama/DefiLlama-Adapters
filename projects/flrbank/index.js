const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  flare: { 
    tvl: sumTokensExport({ owner: '0x194726F6C2aE988f1Ab5e1C943c17e591a6f6059', token: ADDRESSES.flare.WFLR})
  }
}