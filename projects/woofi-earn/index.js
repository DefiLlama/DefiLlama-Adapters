const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
};

(['fantom', 'bsc', 'avax', 'polygon', 'arbitrum', 'optimism', 'zksync', 'base', 'mantle']).forEach(chain => {
	module.exports[chain] = {
		tvl: async () => {
      let data = await get('https://fi-api.woo.org/yield?network=' + chain)
      const tvl = data.data.total_deposit / 1e18
      return toUSDTBalances(tvl)
    }
	}
})
