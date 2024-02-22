const { getExports } = require('../helper/heroku-api')

module.exports = {
	timetravel: false,
	...getExports("manta-atlantic-mantadex", ['manta-atlantic'])
}