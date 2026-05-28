const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens')

const MONETRIX_GENESIS_VAULT = '0xc50A1dd2866A822c81bd0aA00B638c4BdDc9cd63'

const USDC = ADDRESSES.hyperliquid.USDC

module.exports = {
  methodology:
    'TVL is the USDC held by the Monetrix Genesis Vault on HyperEVM. ' +
    'Users deposit USDC into the Genesis Vault during the pre-commit phase and ' +
    'receive non-transferable mgUSDC receipts. After USDM goes live, users may ' +
    'either burn mgUSDC for newly minted USDM (USDC migrates to the main MonetrixVault) ' +
    'or withdraw their original USDC after the per-user delay; both reduce the TVL ' +
    'counted by this adapter.',
  hyperliquid: {
    tvl: sumTokensExport({
      owners: [MONETRIX_GENESIS_VAULT],
      tokens: [USDC],
    }),
  },
}
