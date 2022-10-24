const sdk = require('@defillama/sdk')
const { getResources, coreTokens } = require('../helper/aptos')
const { transformBalances } = require('../helper/portedTokens')
const { log } = require('../helper/utils')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  aptos: {
    tvl: async () => {
      const balances = {}
      const data = await getResources('0x796900ebe1a1a54ff9e932f19c548f5c1af5c6e7d34965857ac2f7b1d1ab2cbf')
      const pools = data.filter(i => i.type.includes('AnimeSwapPoolV1::LiquidityPool'))
      log(`Number of pools: ${pools.length}`)
      pools.forEach(({ type: typeString, data }) => {
        const {
          coin_x_reserve: { value: reserve0 },
          coin_y_reserve: { value: reserve1 },
        } = data
        const [token0, token1] = typeString.split('<')[1].split(', ')
        const isCoreAsset0 = coreTokens.includes(token0)
        const isCoreAsset1 = coreTokens.includes(token1)
        const nonNeglibleReserves = reserve0 !== '0' && reserve1 !== '0'
        if (isCoreAsset0 && isCoreAsset1) {
          sdk.util.sumSingleBalance(balances, token0, reserve0)
          sdk.util.sumSingleBalance(balances, token1, reserve1)
        } else if (isCoreAsset0) {
          sdk.util.sumSingleBalance(balances, token0, reserve0)
          if (nonNeglibleReserves)
            sdk.util.sumSingleBalance(balances, token0, reserve0)
        } else if (isCoreAsset1) {
          sdk.util.sumSingleBalance(balances, token1, reserve1)
          if (nonNeglibleReserves)
            sdk.util.sumSingleBalance(balances, token1, reserve1)
        }
      })
      return transformBalances('aptos', balances)
    }
  }
}