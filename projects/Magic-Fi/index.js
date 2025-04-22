const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'All the tokens deposited into Magic-Fi Network by chain'
};

(['sonic', 'arbitrum', 'optimism', 'polygon', 'base', 'mantle', 'berachain', 'bsc', 'linea']).forEach(chain => {
	module.exports[chain] = {
		tvl: async () => {
      let network = chain
      if (chain == 'era') {
        network = 'zksync'
      }
      let data = await get('https://api-v1.marbleland.io/api/v1/dex?network=' + network)
      const tvl = data.data.total_deposit / 1e18
      return toUSDTBalances(tvl)
    }
	}
})
