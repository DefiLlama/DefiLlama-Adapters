const { compoundExports2 } = require('../helper/compound');
const { mergeExports } = require('../helper/utils');

module.exports = mergeExports([
    compoundExports2({
      comptroller: '0x1E18C3cb491D908241D0db14b081B51be7B6e652',
      cether: ['0xf9b3b455f5d900f62bc1792a6ca6e1d47b989389', '0x0872b71efc37cb8dde22b2118de3d800427fdba0'],
      blacklistedTokens: ['0xf92996ddc677a8dcb032ac5fe62bbf00f92ae2ec']
    }),
    compoundExports2({
      comptroller: '0x273683CA19D9CF827628EE216E4a9604EfB077A3',
      cether: ['0x795dcd51eac6eb3123b7a4a1f906992eaa54cb0e']
    }),
    compoundExports2({
      comptroller: '0xe9266ae95bB637A7Ad598CB0390d44262130F433',
      cether: ['0xafabd582e82042f4a8574f75c36409abea916ac5']
    }),
    compoundExports2({
      comptroller: '0xfFF8Fc176697D04607cF4e23E91c65aeD1c3d3F5',
      cether: ['0x530a8d3fdf61112f8a879d753fe02e9e37ec36aa']
    }),
  ].map(t=>({blast:t})))
