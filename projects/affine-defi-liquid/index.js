const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: sumERC4626VaultsExport({
      vaults: [
        '0x0D53bc2BA508dFdf47084d511F13Bb2eb3f8317B',
        '0x47657094e3AF11c47d5eF4D3598A1536B394EEc4',
      ],
      isOG4626: true,
    }),
  },
}