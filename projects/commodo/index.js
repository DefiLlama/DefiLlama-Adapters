const { get } = require('../helper/http')
const { transformBalances } = require('../helper/portedTokens')
const { PromisePool } = require('@supercharge/promise-pool')
const sdk = require('@defillama/sdk')

let data

async function getData() {
  if (!data) data = _getData()
  return data

  async function _getData() {
    const { assets } = await get('https://rest.comdex.one/comdex/asset/v1beta1/assets')
    const assetMap = assets.reduce((a, i) => {
      a[i.id] = i.denom
      return a
    }, {})
    const { pools } = await get('https://rest.comdex.one/comdex/lend/v1beta1/pools')
    const balances = {
      tvl: {},
      borrowed: {},
    }

    const calls = pools.map(({ pool_id, asset_data }) => {
      return asset_data.map(({ asset_id }) => ([asset_id, pool_id]))
    }).flat()

    await PromisePool
      .withConcurrency(10)
      .for(calls)
      .process(addPool)

    return balances

    async function addPool([assetId, poolId]) {
      const { PoolAssetLBMapping: { total_borrowed, total_lend } } = await get(`https://rest.comdex.one/comdex/lend/v1beta1/pool_asset_lb_mapping/${assetId}/${poolId}`)
      const token = assetMap[assetId]
      sdk.util.sumSingleBalance(balances.tvl, token, total_lend - total_borrowed)
      sdk.util.sumSingleBalance(balances.borrowed, token, total_borrowed)
    }
  }
}


module.exports = {
  timetravel: false,
  comdex: {
    tvl: async () => transformBalances('comdex', (await getData()).tvl),
    borrowed: async () => transformBalances('comdex', (await getData()).borrowed),
  }
}
