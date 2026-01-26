const { sumERC4626VaultsExport } = require('../helper/erc4626')

// This vault strictly follows the ERC4626 standard with USDT as the underlying asset,
// so we can call totalAssets function to get the USDT locked in the vault directly
const POK_USDT_VAULT = '0x5a791CCAB49931861056365eBC072653F3FA0ba0' // POK-USDT ERC4626 Vault

module.exports = {
  bsc: {
    
    tvl: sumERC4626VaultsExport({
      vaults: [
        POK_USDT_VAULT,
      ],
      isOG4626: true,
    }),
  }
}