const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');

const chains = {
	optimism: 10,
	bsc: 56,
	manta: 169,
	fantom: 250,
	pulse: 369,
	base: 8453,
	arbitrum: 42161,
	avax: 43114,
}

function tvlByChain(chainId) {
	return async () => {
		const res = await utils.fetchURL(`https://vaults-api.prd.dexfinance.com/api/common/stats?chainIds=${chainId}`)
		const tvl = res.data.vaults.tvlTotal;
		return toUSDTBalances(tvl);
	}
}

Object.keys(chains).forEach(chain => {
  module.exports[chain] = {
    tvl: tvlByChain(chains[chain])
  }
})