const { queryV1Beta1 } = require('./helper/chain/cosmos')
const ADDRESSES = require('./helper/coreAssets.json')

const coreAssets = new Set()
Object.values(ADDRESSES.osmosis).forEach(i => coreAssets.add(i))
Object.values(ADDRESSES.ibc).forEach(i => coreAssets.add('ibc/' + i))

const sdk = require('@defillama/sdk')

const chain = 'osmosis'

async function tvl(_, _b, _cb, { api, }) {
  // // https://api-osmosis.imperator.co/pools/v2/all?low_liquidity=true
  // https://lcd.osmosis.zone/osmosis/gamm/v1beta1/pools?pagination.limit=100&pagination.count_total=true
  let offset = 0
  let hasMore = true
  const data = []
  let allPools = []
  const blacklistedTokens = new Set()

  do {
    const pools = await queryV1Beta1({ chain, url: '/gamm/v1beta1/pools?pagination.offset=' + offset })
    allPools.push(...pools.pools)
    sdk.log(data.length, pools.pools.length, offset)
    offset += pools.pools.length
    hasMore = pools.pools.length === 100
  } while (hasMore)

  allPools.forEach((i) => {
    const poolId = i?.total_shares?.denom
    if (poolId) blacklistedTokens.add(poolId)
    if (i.address) blacklistedTokens.add(i.address)
  })

  allPools.forEach((i) => {
    const isStableSwap = i['@type'] === '/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool'
    if (isStableSwap) {
      i.pool_liquidity.forEach(i => !blacklistedTokens.has(i.denom) && api.add(i.denom, i.amount))
      return;
    } else {
      const coreData = i.pool_assets.find(i => coreAssets.has(i.token.denom))

      i.pool_assets.forEach(i => {
        if (blacklistedTokens.has(i.token.denom)) return;
        if (!coreAssets.has(i.token.denom) && coreData) {
          api.add(coreData.token.denom, coreData.token.amount)
          return;
        } else if (!coreAssets.has(i.token.denom)) {
          api.add(i.token.denom, i.token.amount)
          return;
        }
        api.add(i.token.denom, i.token.amount)
      })
    }
  })
  return;
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Counts the liquidity on all AMM pools",
  osmosis: {
    tvl
  }
}