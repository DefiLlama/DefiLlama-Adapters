const sdk = require('@defillama/sdk')

const endpoint = 'http://api.flexlend.fi/stats'
const startTimestamp = 1704067200 // 2024-01-01

async function tvl(options) {
	const balances = {}
	const request = {
		method: 'GET',
		headers: {
			accept: 'application/json',
			'x-lulo-api-key': String(process.env.LULO_API_KEY || ''),
		},
	}

	const response = await fetch(`${endpoint}?timestamp=${options.timestamp}`, request)

	const { data } = await response.json()

	data.map(d => {
		sdk.util.sumSingleBalance(balances, d.mintAddress, d.tokens, 'solana')
	})
	return balances
}

module.exports = {
	doublecounted: true,
	timetravel: true,
	start: startTimestamp,
	methodology:
		'Volume is calculated by summing the total USD value of deposited funds in Lulo across all tokens',
	solana: { tvl },
}
