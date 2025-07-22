const { nullAddress, sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
        tokens:[nullAddress],
        owners: ["0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208"]
    })
  }
}