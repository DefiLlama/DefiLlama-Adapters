const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  onfa: {
    tvl: sumTokensExport({ owner: '0xd31985Bf78a6Df49d3A063A99361a48eAc83595e', tokens: [ADDRESSES.onfa.OFT]})
  }
}
