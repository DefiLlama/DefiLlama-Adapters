const { getExports } = require('../helper/heroku-api')

module.exports = {
	timetravel: false,
	...getExports("bvm", ['nos', 'naka']),
}