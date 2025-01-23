const { sumTokens, } = require('../helper/chain/waves')

// https://wavesexplorer.com/addresses/3P3a1jssxc2CGdyC7SGbTJc9ZvTjZ5jBMLZ
module.exports = {
  timetravel: false,
  waves: {
    tvl: () => ({}),
    staking: api => sumTokens({ api, owners: ['3P7dGTVZp8VLDYy3XEaUQbiqfi9cMK1Ly5q'] })
  }
}