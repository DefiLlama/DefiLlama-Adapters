const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')
const nullAddress = '0x0000000000000000000000000000000000000000'

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async () => {
      const pools = await get('https://api.tegro.finance/v1/pair')
      sdk.log(pools.length)

      return transformDexBalances({
        chain: 'ton',
        data: pools.map(i => ({
          token0: i.base.address ?? nullAddress,
          token1: i.quote.address ?? nullAddress,
          token0Bal: i.reserve.base,
          token1Bal: i.reserve.quote,
        }))
      })
    }
  }
}
