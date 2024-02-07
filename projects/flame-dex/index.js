const { sumTokens2, } = require('../helper/chain/tezos')

module.exports = {
  tezos: {
    tvl: async () => {
      return sumTokens2({ owners: ['KT1PRtrP7pKZ3PSLwgfTwt8hD39bxVojoKuX'], includeTezos: true,})
    },
  }
}