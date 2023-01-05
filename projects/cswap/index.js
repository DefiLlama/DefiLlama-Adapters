const { transformDexBalances } = require('../helper/portedTokens')
const { get } = require('../helper/http')

module.exports = {
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
          if (i.balances.length < 2)  return;
          data.push({
            token0: i.balances[0].denom, 
            token1: i.balances[1].denom, 
            token0Bal: i.balances[0].amount, 
            token1Bal: i.balances[1].amount, 
          })
        })
        page++
        nextKey = pagination.next_key
      } while (nextKey)

      return transformDexBalances({ chain: 'comdex', data })
    }
  }
}