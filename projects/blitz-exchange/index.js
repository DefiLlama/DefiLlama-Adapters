const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  blast: {
    tvl: sumTokensExport({ owner: '0xC748532C202828969b2Ee68E0F8487E69cC1d800', tokens: [ADDRESSES.blast.USDB, ADDRESSES.blast.WETH]}),
  },
}