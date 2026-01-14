const ADDRESSES = require('../helper/coreAssets.json')

const VAULT = '0xd53B68fB4eb907c3c1E348CD7d7bEDE34f763805'

async function tvl(api) {
  try {
    const totalAssets = await api.call({
      abi: 'function totalAssets() view returns (uint256)',
      target: VAULT
    })
    api.add(ADDRESSES.ethereum.USDC, totalAssets)
  } catch (error) {
    console.error('LazyUSD TVL adapter error:', error.message)
  }
}

module.exports = {
  doublecounted: true,
  methodology: 'TVL is the total assets under management in the LazyUSD vault, which operates a delta-neutral yield strategy across Ethereum, Solana, and Hyperliquid.',
  ethereum: {
    tvl
  }
}
