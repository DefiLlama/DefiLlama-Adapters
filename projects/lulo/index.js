const { getEnv } = require("../helper/env")

const endpoint = 'http://api.flexlend.fi/stats'

async function tvl(api) {
	const request = {
		method: 'GET',
		headers: {
			accept: 'application/json',
			'x-lulo-api-key': getEnv('LULO_API_KEY'),
		},
	}

	const response = await fetch(`${endpoint}?timestamp=${api.timestamp}`, request)

	const { data } = await response.json()

	data.map(d => {
		api.add(d.mintAddress, d.tokens)
	})
}

module.exports = {
	doublecounted: true,
	timetravel: true,
	start: 1704067200,
	methodology:
		'Volume is calculated by summing the total USD value of deposited funds in Lulo across all tokens',
	solana: { tvl },
}
