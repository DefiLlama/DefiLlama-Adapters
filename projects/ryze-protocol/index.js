const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = '0xdf97B25A935EB72378e0C2D4DC15955ecE612b49'

async function tvl(api) {
  // Fetch all deployed pools from the WeightedPoolFactory
  const pools = await api.fetchList({
    lengthAbi: 'getPoolCount',
    itemAbi: 'pools',
    target: FACTORY,
  })

  // Each pool has exactly 2 assets. Retrieve token addresses via getPoolAsset(index).
  const poolAssets0 = await api.multiCall({
    abi: 'function getPoolAsset(uint256) view returns (address, uint256, uint256, uint8)',
    calls: pools.map((p) => ({ target: p, params: [0] })),
  })

  const poolAssets1 = await api.multiCall({
    abi: 'function getPoolAsset(uint256) view returns (address, uint256, uint256, uint8)',
    calls: pools.map((p) => ({ target: p, params: [1] })),
  })

  // Build tokensAndOwners: for each pool, register both underlying tokens
  // with the pool address as the owner (the pool contract holds the token balances).
  const tokensAndOwners = []
  for (let i = 0; i < pools.length; i++) {
    // getPoolAsset returns (token, balance, weight, decimals) — we only need token
    const token0 = poolAssets0[i][0]
    const token1 = poolAssets1[i][0]
    tokensAndOwners.push([token0, pools[i]])
    tokensAndOwners.push([token1, pools[i]])
  }

  // Aggregates all token balances. sumTokens2 internally calls balanceOf
  // for each (token, owner) pair and sums the results.
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology:
    'TVL is calculated as the sum of all token balances held across all Ryze Protocol Weighted Pools. ' +
    'Pool addresses are fetched from the WeightedPoolFactory via getPoolCount() and pools(). ' +
    'Each pool underlying token address is retrieved using getPoolAsset(index). ' +
    'Token balances are aggregated using sumTokens2.',
  start: '2026-04-12', // actual Base factory deployment date
  base: {
    tvl,
  },
}
