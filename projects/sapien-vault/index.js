const { sumERC4626VaultsExport2 } = require('../helper/erc4626')

const VAULT = '0x60Bf63729f688287a450299962b36Cef0aFfaa42'

module.exports = {
  methodology:
    'TVL is SAPIEN held by the Base ERC-4626 Sapien PoQ Vault, measured on-chain via totalAssets(). Protocol-owned SAPIEN in RewardsController is excluded.',
  start: '2026-04-07',
  base: {
    tvl: sumERC4626VaultsExport2({ vaults: [VAULT] }),
  },
}
