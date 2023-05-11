
const { lending } = require('../helper/acala/lending')

module.exports = {
  acala: { tvl: async () => lending('acala') },
};