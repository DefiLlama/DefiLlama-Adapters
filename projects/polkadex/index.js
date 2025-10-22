const { getExports } = require('../helper/heroku-api')

module.exports = {
	deadFrom: '2025-02-01',
	timetravel: false,
	...getExports("polkadex", ['polkadex'], ['staking'])
}