const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const BITS_VAULTS = [
  '0x0000000000000000000000000000000000000000', // add finalized address here
]

// CoreDAO token addresses
const WCORE = ADDRESSES.core.WCORE
const COREBTC = ADDRESSES.core.coreBTC

// Token configuration for different vaults - only COREBTC is supported
const VAULT_TOKENS = {
  [BITS_VAULTS[0]]: [COREBTC],
}

async function tvl(api) {
  // Track TVL for all vaults
  for (const vault of BITS_VAULTS) {
    
    const tokens = VAULT_TOKENS[vault] || [COREBTC]
    
    // Get balances for each token in the vault
    for (const token of tokens) {
      const balance = await api.call({
        abi: 'erc20:balanceOf',
        target: token,
        params: [vault],
      })
      api.add(token, balance)
    }
  }
}

module.exports = {
  methodology: 'Counts the total value of COREBTC assets locked in Bits yield product contracts on CoreDAO network.',
  start: 1749621314, // Replace with actual start timestamp
  core: {
    tvl,
  }
} 