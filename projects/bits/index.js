const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const BITS_VAULTS = [
  '0x02ad570A8f361c1F8ba630D015fcA02862F2478f', // WBTC vault on Ethereum
]

// Ethereum token addresses
const WBTC = ADDRESSES.ethereum.WBTC

async function tvl(api) {
  // Get WBTC balances for all vaults using multicall
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: BITS_VAULTS.map(vault => ({
      target: WBTC,
      params: [vault]
    }))
  })
  
  // Add all balances to the API
  api.add(WBTC, balances)
}

module.exports = {
  methodology: 'Counts the total value of WBTC assets locked in Bits yield product contracts on Ethereum network.',
  start: 1749621314, // Replace with actual start timestamp
  ethereum: {
    tvl,
  }
} 