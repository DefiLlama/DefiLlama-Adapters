const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')
const nullAddress = ADDRESSES.null

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async () => {
      const pools = await get('https://api.tegro.finance/v1/pairs')
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
