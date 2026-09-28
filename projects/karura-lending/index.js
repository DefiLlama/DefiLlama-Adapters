const { lending } = require('../helper/acala/lending')

module.exports = {
  timetravel: false,
  karura: { tvl: () => lending('karura') },
}
