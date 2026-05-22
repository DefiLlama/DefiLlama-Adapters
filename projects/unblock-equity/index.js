const { getCuratorExport } = require('../helper/curators')

const configs = {
  methodology:
    'Sum of totalAssets() across all UnblockEquity MetaMorpho V2 vaults on Base. Each vault accepts USDC deposits and lends against tokenized residential property liens (ERC-1155). Vaults are segmented by borrower verification level (Verified/Prime/Standard), recovery type (Lien-Only/Foreclosure), and escrow tier (None/BR3/BR6/BR12).',
  start: 1774396800, // 2026-03-25 UTC — Phase 06.1 deployment date
  blockchains: {
    base: {
      morphoVaultOwners: [
        '0x6D9DA17560d584bB03255905ab42C2F4d67eA9B4',
      ],
    },
  },
}

module.exports = getCuratorExport(configs)
