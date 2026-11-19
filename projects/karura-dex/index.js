const { dex } = require('../helper/acala/dex')

module.exports = {
  timetravel: false,
  karura: { tvl: () => dex('karura') },
}
