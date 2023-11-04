const { queryV1Beta1 } = require('./helper/chain/cosmos')
const { transformDexBalances } = require('./helper/portedTokens')

const chain = 'osmosis'
async function tvl(_, _b, _cb, { api, }) {
  // // https://api-osmosis.imperator.co/pools/v2/all?low_liquidity=true
  // https://lcd.osmosis.zone/osmosis/gamm/v1beta1/pools?pagination.limit=100&pagination.count_total=true
  let offset = 0
  let hasMore = true
  const data = []
  const blacklistedTokens = []
  const types = new Set()
  do {
    const pools = await queryV1Beta1({ chain, url: '/gamm/v1beta1/pools?pagination.offset=' + offset })
    pools.pools.forEach((p) => {
      types.add(p['@type'])
      const i = p.pool_assets
      if (!i) {
        if (p.pool_liquidity) {
          p.pool_liquidity.forEach(i => !blacklistedTokens.includes(i.denom) && api.add(i.denom, i.amount))
          return;
        }
        console.log(p)
        return;
      }
      const poolId = p?.total_shares?.denom
      if (poolId) blacklistedTokens.push(poolId)
      if (p.address) blacklistedTokens.push(p.address)

      // if (i.length !== 2) {
        i.forEach(i => !blacklistedTokens.includes(i.token.denom) && api.add(i.token.denom, i.token.amount))
      // } else {
      //   data.push({
      //     token0: i[0].token.denom,
      //     token1: i[1].token.denom,
      //     token0Bal: i[0].token.amount,
      //     token1Bal: i[1].token.amount,
      //   })
      // }
    })
    console.log(data.length, pools.pools.length, offset)
    offset += pools.pools.length
    hasMore = pools.pools.length === 100
  } while (hasMore)
  console.log(types, blacklistedTokens)
  return transformDexBalances({ chain, data, balances: api.getBalances(), blacklistedTokens })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Counts the liquidity on all AMM pools",
  osmosis: {
    tvl
  }
}