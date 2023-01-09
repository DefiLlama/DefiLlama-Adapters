const {fetchURL} = require('./helper/utils')
const {toUSDTBalances} = require('./helper/balances')

async function tvl() {
	const data = await fetchURL("https://api.deflex.fi/api/analytics")
	return toUSDTBalances(data.data.tvl.usd)
}

module.exports = {
	misrepresentedTokens: true,
	algorand: {
		tvl
	}
}