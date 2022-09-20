const { getTridentTVL } = require('../helper/sushi-trident')

module.exports = {
  klaytn: {
    tvl: getTridentTVL({
      chain: 'klaytn',
      factory: '0x3d94b5e3b83cbd52b9616930d33515613adfad67'
    }),
  },
}