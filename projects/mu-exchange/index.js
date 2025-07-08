const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  xdai: {
    tvl: sumTokensExport({ owners: ['0x0d80d7f7719407523a09ee2ef7ed573e0ea3487a', '0x1946740274E0DC06649EE2bD0d545eB288C84604'], tokens: [ADDRESSES.xdai.SDAI] }),
  }
}
