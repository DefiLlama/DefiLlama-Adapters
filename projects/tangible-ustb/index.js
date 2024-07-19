const { sumTokensExport } = require('../helper/unwrapLPs')
const USTB = '0x83fedbc0b85c6e29b589aa6bdefb1cc581935ecd'

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: USTB, tokens: ["0x59D9356E565Ab3A36dD77763Fc0d87fEaf85508C"]}),
  },
}