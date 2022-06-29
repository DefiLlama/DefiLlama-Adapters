
const { dex } = require('../helper/acala/dex')

module.exports = {
  karura: { tvl: async () => dex('karura') },
};