
const { staking } = require('../helper/acala/lcdot')

module.exports = {
  acala: { tvl: async () => staking('acala') },
};