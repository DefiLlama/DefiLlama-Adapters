const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  berachain: {
    tvl: sumTokensExport({ owner: '0xb7E448E5677D212B8C8Da7D6312E8Afc49800466', token: ADDRESSES.berachain.HONEY})
  }
}