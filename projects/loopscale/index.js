const sdk = require('@defillama/sdk')
 
const endpoint = 'https://tars.loopscale.com/v1/markets/tvl/balances'
const startTimestamp = 1733072400 // 2024-12-01, 12PM ET

async function tvl(api) {
	const request = {
		method: 'GET',
		headers: {
			accept: 'application/json',
		},
	}

	const response = await fetch(`${endpoint}?timestamp=${api.timestamp}`, request)

	const data = await response.json()

	data.map(d => {
		api.add(d.mint, d.balance)
	})
}

module.exports = {
	doublecounted: false,
	timetravel: true,
	start: startTimestamp,
	methodology:
		'TVL is calculated by summing up all unused deposits and supplied collateral',
	solana: { tvl },
}
