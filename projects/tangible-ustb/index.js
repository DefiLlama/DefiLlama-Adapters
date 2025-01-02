const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const USTB = '0x83fedbc0b85c6e29b589aa6bdefb1cc581935ecd'

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: USTB, tokens: [ADDRESSES.ethereum.USDM]}),
  },
}