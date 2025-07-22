const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'The calculated TVL is the current USD sum of all pools from core contract',
  ...getExports("satoshi-dex", ['stacks']),
}
