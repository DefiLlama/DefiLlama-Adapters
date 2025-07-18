const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const BITS_VAULTS = [
  '0x02ad570A8f361c1F8ba630D015fcA02862F2478f', // WBTC vault on Ethereum
]

// Ethereum token addresses
const WBTC = ADDRESSES.ethereum.WBTC

// Token configuration for different vaults - only WBTC is supported
const VAULT_TOKENS = {
  [BITS_VAULTS[0]]: [WBTC],
}

async function tvl(api) {
  // Track TVL for all vaults
  for (const vault of BITS_VAULTS) {
    
    const tokens = VAULT_TOKENS[vault] || [WBTC]
    
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
  methodology: 'Counts the total value of WBTC assets locked in Bits yield product contracts on Ethereum network.',
  start: 1749621314, // Replace with actual start timestamp
  ethereum: {
    tvl,
  }
} 