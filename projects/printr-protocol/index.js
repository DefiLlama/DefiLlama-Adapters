const { defaultTokens } = require('../helper/cex')

// Printr contract is deployed at the same address on all EVM chains (CREATE2)
const PRINTR_CONTRACT = '0xb77726291b125515d0a7affeea2b04f2ff243172'

// Chain ID mapping for API calls
const chainIds = {
  ethereum: 1,
  bsc: 56,
  arbitrum: 42161,
  base: 8453,
  avax: 43114,
  mantle: 5000,
  monad: 143,
}

/**
 * Calculates TVL for Printr protocol on a specific chain
 * TVL = sum of reserves locked in active bonding curves
 * @param {object} api - DefiLlama SDK API object
 */
async function tvl(api) {
  const treasury = await api.call({ target: PRINTR_CONTRACT, abi: 'function treasury() view returns (address)' })
  const wNative = await api.call({ target: PRINTR_CONTRACT, abi: 'function wrappedNativeToken() view returns (address)' })
  await api.sumTokens({ owner: treasury, tokens: [wNative, ...(defaultTokens[api.chain] || [])] })
}

module.exports = {
  methodology: 'TVL is the sum of reserves locked in active Printr bonding curves. Each curve holds a base pair token (e.g., USDC, WETH) that users deposit to buy Telecoins. Graduated tokens (curves with completionThreshold=0) are excluded because their liquidity has moved to DEX pools and would otherwise be double-counted.',
}

// Register TVL function for each supported chain
Object.keys(chainIds).forEach(chain => {
  module.exports[chain] = { tvl }
})
