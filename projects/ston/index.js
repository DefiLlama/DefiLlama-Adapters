const { post } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async () => {
      const { result: {pools}} = await post('https://app.ston.fi/rpc', {"jsonrpc":"2.0","id":2,"method":"pool.list","params":{}})
      sdk.log(pools.length)

      return transformDexBalances({
        chain: 'ton',
        data: pools.map(i => ({
          token0: i.token0_address,
          token1: i.token1_address,
          token0Bal: i.reserve0,
          token1Bal: i.reserve1,
        }))
      })
    }
  }
}
