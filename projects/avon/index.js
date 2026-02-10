const { sumERC4626VaultsExport2 } = require('../helper/erc4626')

module.exports = {
  methodology: "TVL is the underlying USDm managed by MegaVault, measured via the ERC4626 totalAssets() value.",
  megaeth: {
    tvl: sumERC4626VaultsExport2({ vaults: ['0x2eA493384F42d7Ea78564F3EF4C86986eAB4a890'], }),
  },
}
