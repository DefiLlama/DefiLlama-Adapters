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
      const data = await getResources('0x6b1a0749af672861c5dfd301dcd7cf85973c970d6088bae4f4a34e2effcb9e5e')
      const pools = data.filter(i => i.type.includes('AtodexSwapPoolV1::LiquidityPool'))
      log(`Number of pools: ${pools.length}`)
      pools.forEach(({ type: typeString, data }) => {
        const {
          coin_x_reserve: { value: reserve0 },
          coin_y_reserve: { value: reserve1 },
        } = data
        const [token0, token1] = typeString.replace('>', '').split('<')[1].split(', ')
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