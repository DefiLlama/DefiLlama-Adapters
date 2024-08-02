const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: sumERC4626VaultsExport({
      vaults: [
        '0xcbC632833687DacDcc7DfaC96F6c5989381f4B47',
        '0xF0a949B935e367A94cDFe0F2A54892C2BC7b2131',
      ],
      isOG4626: true,
    }),
  },
}
