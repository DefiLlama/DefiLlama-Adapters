const { getExports } = require('../helper/heroku-api')

module.exports = {
	timetravel: false,
	// ...getExports("genshiro", ['genshiro']),
	genshiro: {
		tvl: async () => ({}),
	},
	deadFrom: '2023-05-26',
}