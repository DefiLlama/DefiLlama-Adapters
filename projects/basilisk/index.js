const { compoundExports2 } = require('../helper/compound');

module.exports = {
  era: compoundExports2({
    comptroller: '0x4085f99720e699106bc483dAb6CAED171EdA8D15',
    cether: '0x1e8F1099a3fe6D2c1A960528394F4fEB8f8A288D',
    fetchBalances: true,
  })
}; 