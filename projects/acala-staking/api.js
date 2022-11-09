
const { staking } = require('../helper/acala/liquidStaking')

module.exports = {
  acala: { tvl: async () => staking('acala') },
};