const { dex } = require('../helper/acala/dex')

module.exports = {
  timetravel: false,
  acala: { tvl: () => dex('acala') },
}
