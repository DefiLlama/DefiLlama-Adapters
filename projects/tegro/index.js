const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async () => {
      const pools = await get('https://api.tegro.finance/pairs')
      sdk.log(pools.length)

      return transformDexBalances({
        chain: 'ton',
        data: pools.map(i => ({
          token0: i.leftAddress,
          token1: i.rightAddress,
          token0Bal: i.leftReserved,
          token1Bal: i.rightReserved,
        }))
      })
    }
  }
}
