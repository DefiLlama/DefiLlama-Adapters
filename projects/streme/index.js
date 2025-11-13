const { sumTokensExport } = require('../helper/unwrapLPs');

const STAKING_CONTRACT = '0x293A5d47f5D76244b715ce0D0e759E0227349486'
const STREME_TOKEN = '0x3b3cd21242ba44e9865b066e5ef5d1cc1030cc58'

const staking = sumTokensExport({
	owners: [STAKING_CONTRACT],
	tokens: [STREME_TOKEN],
})

module.exports = {
	methodology: 'Staking tracks STREME tokens held in the primary staking/treasury contract on Base.',
	start: 26098345,
	base: {
		tvl: () => ({}),
		staking,
	},
}