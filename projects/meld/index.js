const { sumTokensExport } = require('../helper/chain/cardano')

module.exports = {
  timetravel: false,
  cardano: {
    staking: sumTokensExport({ owner: 'addr1wxar2qwdzuxfvdyuxsk9aapy93vkkk904mxullqtkp90pmqh0xrmz', tokens: ['6ac8ef33b510ec004fe11585f7c5a9f0c07f0c23428ab4f29c1d7d104d454c44'] }),
    tvl: () => ({}),
  }
}
