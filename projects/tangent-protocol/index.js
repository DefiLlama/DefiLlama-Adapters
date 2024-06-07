const { sumTokensExport } = require('../helper/chain/cardano')

module.exports = {
  cardano: {
    tvl: () => 0,
    staking: sumTokensExport({ owner: 'addr1qyglpmc5gq5gdgd5fznfwlwjdn3xkgyjkdpt6mdjkq8knaqpta0u8t4h8ljhzygdg9lsx2rg92darh9gny4wh0w4s9zsntv7aw'}),
  },
};
