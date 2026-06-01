const ADDRESSES = require('../helper/coreAssets.json')

// JackCo: No-loss lottery — deposits earn yield across Aave, Morpho, Pendle;
// weekly prize pool funded entirely by yield (principal always 100% safe).
//
// TVL = USDC managed by each chain's JackCoVault (ERC-4626).
// totalAssets() tracks _totalManagedAssets (incremented on deposit, decremented
// on withdrawal, synced weekly to strategyManager.totalValue() + vaultBalance).

const config = {
  // Base (8453) — primary chain
  base: {
    vault: '0xB751a4831A893a2feaC6D9642E6680f13D8dbDD2',
    usdc:  ADDRESSES.base.USDC,  // 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
  },
  // Ethereum mainnet (1)
  ethereum: {
    vault: '0x0e710E542033f3D4292A6E0B0A69923e0B6b43CF',
    usdc:  ADDRESSES.ethereum.USDC,  // 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
  },
  // Arbitrum (42161)
  arbitrum: {
    vault: '0xbA30Fcfb482c8897D9fBDD55cf1606f4442A6a43',
    usdc:  ADDRESSES.arbitrum.USDC,
  },
  // Optimism (10)
  optimism: {
    vault: '0x498f98E70968Be25D770a812F2a1a458f1Ee79Be',
    usdc:  ADDRESSES.optimism.USDC,
  },
  // Polygon (137)
  polygon: {
    vault: '0x498f98E70968Be25D770a812F2a1a458f1Ee79Be',
    usdc:  ADDRESSES.polygon.USDC,
  },
  // BSC (56)
  bsc: {
    vault: '0x498f98E70968Be25D770a812F2a1a458f1Ee79Be',
    usdc:  ADDRESSES.bsc.USDC,
  },
  // Avalanche (43114)
  avax: {
    vault: '0x498f98E70968Be25D770a812F2a1a458f1Ee79Be',
    usdc:  ADDRESSES.avax.USDC,
  },
}

async function tvl(api) {
  const { vault, usdc } = config[api.chain]
  const total = await api.call({
    target: vault,
    abi:    'uint256:totalAssets',
  })
  api.add(usdc, total)
}

module.exports = {
  methodology: 'Counts USDC deposited in JackCo no-loss lottery vaults (ERC-4626) across all deployed chains. TVL includes funds deployed across Aave, Morpho, and Pendle yield adapters, as tracked by each vault\'s totalAssets(), synced weekly with the StrategyManager.',
  ...Object.fromEntries(
    Object.keys(config).map(chain => [chain, { tvl }])
  ),
}
