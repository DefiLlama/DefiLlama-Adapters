const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  blast: {
    tvl: sumTokensExport({ owner: '0x3Ba925fdeAe6B46d0BB4d424D829982Cb2F7309e', tokens: [ADDRESSES.blast.USDB, ADDRESSES.blast.WETH]}),
  },
}
