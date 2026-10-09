const { staking } = require('../helper/acala/lcdot')

module.exports = {
  timetravel: false,
  acala: { tvl: () => staking('acala') },
}
