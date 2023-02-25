
const { staking } = require('../helper/acala/liquidStaking')

module.exports = {
  karura: { tvl: async () => staking('karura') },
  acala: { tvl: async () => staking('acala') },
};