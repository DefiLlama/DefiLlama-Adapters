const { queryAddresses, sumTokens } = require('../helper/chain/radixdlt')
const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')
const sdk = require('@defillama/sdk')

// full pool list from the ociswap API (cached); the API ignores a pool_type query param, so filtering is done client side
async function getPools() {
  return getConfig('ociswap', null, {
    fetcher: async () => {
      let items = []
      let cursor = 0
      do {
        const { data, next_cursor } = await get(`https://api.ociswap.com/pools?cursor=${cursor}&limit=100`)
        items.push(...data)
        sdk.log(`Fetched ${items.length} pools`, data.length, next_cursor)
        cursor = next_cursor
      } while (items.length % 100 === 0 && cursor !== 0)
      return items
    }
  })
}

// on-chain owners holding the pool reserves:
// - PrecisionPool components keep the token vaults on the component itself
// - Basic / flex pools delegate to a native `liquidity_pool` component referenced in metadata
// both are summed, the parent component of a delegating pool only holds fee dust
async function getPoolOwners(pools) {
  const items = await queryAddresses({ addresses: pools.map(i => i.address) })
  const owners = new Set()
  for (const item of items) {
    owners.add(item.address)
    const lp = item.metadata?.items?.find(i => i.key === 'liquidity_pool')?.value?.typed?.value
    if (lp) owners.add(lp)
  }
  return [...owners]
}

// radixdlt tvl export for the given pool types (all pools when `poolTypes` is omitted)
function ociswapTvl(poolTypes) {
  return async (api) => {
    let pools = await getPools()
    if (poolTypes) pools = pools.filter(i => poolTypes.includes(i.pool_type))
    const owners = await getPoolOwners(pools)
    return sumTokens({ owners, api })
  }
}

module.exports = {
  getPools,
  getPoolOwners,
  ociswapTvl,
}
