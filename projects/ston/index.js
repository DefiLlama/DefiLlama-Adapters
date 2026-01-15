const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async () => {
      const [poolsResult, assetsResult] = await Promise.all([
        get("https://api.ston.fi/v1/pools?dex_v2=true"),
        get("https://api.ston.fi/v1/assets")
      ])

      const pricedTokens = new Set(
        assetsResult.asset_list
          .filter(asset => asset.dex_usd_price != null)
          .map(asset => asset.contract_address)
      )

      const validPools = poolsResult.pool_list.filter(i => {
        return pricedTokens.has(i.token0_address) && pricedTokens.has(i.token1_address)
      })

      return transformDexBalances({
        chain: 'ton',
        data: validPools.map(i => ({
          token0: i.token0_address,
          token1: i.token1_address,
          token0Bal: i.reserve0,
          token1Bal: i.reserve1,
        })),
      })
    }
  }
}
