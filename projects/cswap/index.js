const { transformDexBalances } = require('../helper/portedTokens')
const { get } = require('../helper/http')

module.exports = {
  deadFrom: '2024-09-17',
  hallmarks: [[1726531200,'Sunset of cSwap']],
  timetravel: false,
  misrepresentedTokens: true,
  comdex: {
    tvl: async () => {
      let page = 1
      let data = []
      let nextKey
      
      do {
        const paginationKey = nextKey ? `pagination.key=${nextKey}` : ''
        const api = `https://rest.comdex.one/comdex/liquidity/v1beta1/pools/1?${paginationKey}`
        const { pagination, pools } = await get(api)
        pools.forEach(i => {
          if (!i.balances.base_coin || !i.balances.quote_coin)  return;
          data.push({
            token0: i.balances.base_coin.denom, 
            token1: i.balances.quote_coin.denom, 
            token0Bal: i.balances.base_coin.amount, 
            token1Bal: i.balances.quote_coin.amount, 
          })
        })
        page++
        nextKey = pagination.next_key
      } while (nextKey)

      return transformDexBalances({ chain: 'comdex', data })
    }
  }
}