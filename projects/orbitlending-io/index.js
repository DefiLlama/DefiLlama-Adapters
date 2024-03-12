const { compoundExports2 } = require('../helper/compound');

module.exports = {
  blast: compoundExports2({
    comptroller: '0x1E18C3cb491D908241D0db14b081B51be7B6e652',
    cether: ['0xf9b3b455f5d900f62bc1792a6ca6e1d47b989389', '0x0872b71efc37cb8dde22b2118de3d800427fdba0'],
    blacklistedTokens: ['0xf92996ddc677a8dcb032ac5fe62bbf00f92ae2ec']
  }),
}; 
