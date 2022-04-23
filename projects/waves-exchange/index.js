const { sumSingleBalance } = require('@defillama/sdk/build/generalUtil')
const { get } = require('../helper/http')
const { wavesMapping } = require('../helper/portedTokens')


const endpoint = "https://waves.exchange/api/v1/liquidity_pools/stats"

async function tvl() {
	const balances = {}
	const data = (await get(endpoint)).items
	data.forEach(item => {
		sumSingleBalance(balances, getTokenId(item.amount_asset_id), +item.amount_asset_balance)
		sumSingleBalance(balances, getTokenId(item.price_asset_id), +item.price_asset_balance)
	})

	return balances
}

function getTokenId(token) {
	if (wavesMapping[token]) return wavesMapping[token].coingeckoId
	return token
}

module.exports = {
	timetravel: false,
	waves: {
		tvl
	},
}