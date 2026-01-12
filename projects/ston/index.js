const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')
const { getCoreAssets } = require('../helper/tokenMapping')

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async () => {
      const result = await get("https://api.ston.fi/v1/pools?dex_v2=true")
      const coreTokens = new Set(getCoreAssets('ton'))

      // Only include pools where at least one token is a known core asset.
      // This prevents issues with spam token pools (e.g. SCAM1/SCAM2) that:
      // 1. Cannot be reliably priced (no core asset to derive price from)
      // 2. May cause price lookup failures for unknown tokens
      const validPools = result.pool_list.filter(i => {
        return coreTokens.has(i.token0_address) || coreTokens.has(i.token1_address)
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
