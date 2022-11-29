
const { lending } = require('../helper/acala/lending')

module.exports = {
  karura: { tvl: async () => lending('karura') },
};