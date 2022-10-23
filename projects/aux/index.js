const sdk = require('@defillama/sdk')
const { getResources, coreTokens } = require('../helper/aptos')
const { transformBalances } = require('../helper/portedTokens')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  aptos: {
    tvl: async () => {
      const balances = {}
      const data = await getResources('0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541')
      // AUX uses integrated liquidity from both pools and clob on-chain, so we sum pool and clob's liquidity here

      // Compute pool's TVL
      const pools = data.filter(i => i.type.includes('amm::Pool'))
      pools.forEach(({ type: typeString, data }) => {
        const reserve0 = data.x_reserve.value;
        const reserve1 = data.y_reserve.value;
        const [token0, token1] = typeString.slice(0, -1).split('<')[1].split(', ')
        
        if (coreTokens.includes(token0) && reserve0 !== '0') {
            sdk.util.sumSingleBalance(balances, token0, reserve0)
        }
        if (coreTokens.includes(token1) && reserve1 !== '0') {
            sdk.util.sumSingleBalance(balances, token1, reserve1)
        }
      })

      // Compute CLOB's TVL from vault
      const coins = data.filter(i => i.type.includes('CoinStore'))
      coins.forEach(({ type: typeString, data }) => {
        const token = typeString.slice(0, -1).split('<')[1]
        const reserve = data.coin.value;
        if (coreTokens.includes(token) && reserve !== '0') {
            sdk.util.sumSingleBalance(balances, token, reserve)
        }
      })
      
      return transformBalances('aptos', balances)
    }
  }
}