const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
};

(['fantom', 'bsc', 'avax', 'polygon', 'arbitrum', 'optimism', 'era', 'base', 'mantle']).forEach(chain => {
	module.exports[chain] = {
		tvl: async () => {
      let network = chain
      if (chain == 'era') {
        network = 'zksync'
      }
      let data = await get('https://fi-api.woo.org/yield?network=' + network)
      const tvl = data.data.total_deposit / 1e18
      return toUSDTBalances(tvl)
    }
	}
})
