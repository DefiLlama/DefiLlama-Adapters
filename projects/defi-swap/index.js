const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  start: 1599523200, // Tuesday, 8 September 2020 00:00:00
  ethereum: {
    tvl: getUniTVL({ factory: '0x9DEB29c9a4c7A88a3C0257393b7f3335338D9A9D'})
  },
}
