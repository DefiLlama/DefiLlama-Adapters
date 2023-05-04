const { sumTokensExport,  } = require('../helper/chain/cardano')

const gens = 'dda5fdb1002f7389b33e036b6afee82a8189becb6cba852e8b79b4fb0014df1047454e53'
const nmkr = '5dac8536653edc12f6f5e1045d8164b9f59998d3bdc300fc928434894e4d4b52'
const ntx = 'edfd7a1d77bcb8b884c474bdc92a16002d1fb720e454fa6e993444794e5458'

const owner = 'addr1w8r99sv75y9tqfdzkzyqdqhedgnef47w4x7y0qnyts8pznq87e4wh'

module.exports = {
  timetravel: false,
  cardano: {
    staking: sumTokensExport({ owner, tokens: [gens, nmkr, ntx]}),
    tvl: () => ({})
  }
};
