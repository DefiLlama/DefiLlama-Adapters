const ADDRESSES = require('../helper/coreAssets.json')

const VAULT = '0xd53B68fB4eb907c3c1E348CD7d7bEDE34f763805'

async function tvl(api) {
  // LazyUSD is a delta-neutral yield vault that manages assets across multiple chains
  // (Ethereum, Solana, Hyperliquid) but the vault contract on Ethereum tracks total NAV
  const totalAssets = await api.call({
    abi: 'function totalAssets() view returns (uint256)',
    target: VAULT
  })

  // totalAssets returns value in USDC (6 decimals)
  api.add(ADDRESSES.ethereum.USDC, totalAssets)
}

module.exports = {
  doublecounted: true,
  methodology: 'TVL is the total assets under management in the LazyUSD vault, which operates a delta-neutral yield strategy across Ethereum, Solana, and Hyperliquid.',
  ethereum: {
    tvl
  }
}
