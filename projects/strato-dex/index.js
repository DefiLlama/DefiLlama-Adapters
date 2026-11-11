const { getV2Pools, getV3Pools, sumPoolBalances } = require('../helper/chain/strato')

// STRATO swap pools: constant-product + StablePool (PoolFactory) and concentrated-liquidity
// (PoolV3Factory). TVL is every pool token held by the pool contracts, USDST included.
async function tvl(api) {
  const pools = [...await getV2Pools(), ...await getV3Pools()]
  await sumPoolBalances(api, pools)
}

module.exports = {
  methodology:
    'Swap pools enumerated on-chain from PoolFactory.allPools (constant-product and StablePool; StablePool coins enumerated via getNumCoins/coins so multi-coin pools are fully counted) and PoolV3Factory.allPools (concentrated liquidity). TVL is the balance of each pool token held by the pool contract, read via batched eth_call (STRATO has no Multicall3). Prices resolved server-side by DefiLlama for the `strato` chain; tokens traded only on these pools are priced from pool depth.',
  timetravel: false,
  start: '2026-04-02',
  strato: { tvl },
}
