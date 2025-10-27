const { sumERC4626VaultsExport } = require('./helper/erc4626')

module.exports = {
  base: {
    tvl: sumERC4626VaultsExport({
      vaults: [
        '0xd61bfc9ca1d0d2b03a3dd74e2ab81df8e5f606e8', // Snowbl Capital ERC4626 Vault
      ],
      isOG4626: true,
    }),
  }
}