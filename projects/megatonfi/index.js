const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')
const nullAddress = ADDRESSES.null

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async () => {
      const lpInfoList = await get('https://megaton.fi/api/lp/infoList');
      const pools = lpInfoList[0]

      return transformDexBalances({
        chain: 'ton',
        data: pools.map(pool => ({
          token0: pool.token0 ?? nullAddress,
          token1: pool.token1 ?? nullAddress,
          token0Bal: pool.amount0,
          token1Bal: pool.amount1,
        }))
      })
    }
  }
}

