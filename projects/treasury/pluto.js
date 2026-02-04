const { sumTokens, } = require('../helper/chain/waves')

// https://wavesexplorer.com/addresses/3P3a1jssxc2CGdyC7SGbTJc9ZvTjZ5jBMLZ
module.exports = {
  timetravel: false,
  waves: {
    tvl: api => sumTokens({ api, owners: ['3PKFFFsiKR7rgaeoLQZj6jLsxteZigccN8h'], }),
  }
}