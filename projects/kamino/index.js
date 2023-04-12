const { getExports } = require('../helper/heroku-api')

module.exports = {
	doublecounted: true,
	timetravel: false,
  misrepresentedTokens: true,
	...getExports("kamino", ['solana'])
}