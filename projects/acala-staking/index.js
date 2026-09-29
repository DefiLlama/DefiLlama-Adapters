const { staking } = require('../helper/acala/liquidStaking')

module.exports = {
  timetravel: false,
  acala: { tvl: () => staking('acala') },
}
