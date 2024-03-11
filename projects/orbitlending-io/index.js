const { compoundExports2 } = require('../helper/compound');

module.exports = {
  blast: compoundExports2({
    comptroller: '0x1E18C3cb491D908241D0db14b081B51be7B6e652',
    cether: '0xF9B3B455f5d900f62bC1792A6Ca6e1d47B989389',
    blacklistedTokens: ['0xf92996ddc677a8dcb032ac5fe62bbf00f92ae2ec']
  }),
}; 
