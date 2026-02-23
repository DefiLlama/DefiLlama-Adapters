const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

/**
 * Denaria — Perpetual DEX on Linea
 *
 * TVL methodology (DeFiLlama):
 * - Counts USDC (canonical Linea USDC) held in Denaria Vault(s) on Linea.
 * - This adapter is intentionally minimal: it only accounts for collateral locked in the Vault.
 *
 * Notes:
 * - If in the future Denaria deploys additional Vaults (other pairs/markets),
 *   add them to the "toa" list below.
 */

const config = {
  linea: {
    toa: [
      // [tokenAddress, ownerAddress]
      [ADDRESSES.linea.USDC, '0x168fca57a05354b8d889ecee78d978040690ee5a'],       // Old Vault
      [ADDRESSES.linea.USDC, '0xb93ad0bfecf3c698eb570fc42f8bd6346053c79a'],       // New Vault
    ],
  },
}

module.exports = {
  methodology: 'Counts USDC locked in Denaria Vault(s) on Linea.',
}

Object.keys(config).forEach(chain => {
  const { toa = [] } = config[chain]
  module.exports[chain] = {
    tvl: (_, _b, { [chain]: block }) =>
      sumTokens2({ chain, block, tokensAndOwners: toa }),
  }
})
