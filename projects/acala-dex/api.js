
const { dex } = require('../helper/acala/dex')

module.exports = {
  acala: { tvl: async () => dex('acala') },
};