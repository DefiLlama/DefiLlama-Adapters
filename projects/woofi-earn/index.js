const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
};

// Active and legacy vault networks
// Note: legacy vaults (fantom, era, mantle) retain remaining user deposits on-chain;
// keep tracked so TVL remains accurate until vaults are fully cleared.
const chains = [
  'bsc',
  'avax',
  'polygon',
  'arbitrum',
  'optimism',
  'base',
  'mantle',
  'era',
  'fantom',
];

chains.forEach(chain => {
	module.exports[chain] = {
		tvl: async () => {
      const net = chain === 'era' ? 'zksync' : chain;
      let data = await get('https://fi-api.woo.org/yield?network=' + net)
      const tvl = Number(data.data.total_deposit) / 1e18
      return toUSDTBalances(tvl)
    }
	}
})
