const { mergeExports } = require('../helper/utils')
const { compoundExports2 } = require('../helper/compound')

module.exports = mergeExports([
  {  cronos: compoundExports2({ comptroller: '0xb3831584acb95ed9ccb0c11f677b5ad01deaeec0', cether: '0xeadf7c01da7e93fdb5f16b0aa9ee85f978e89e95', }),},
  {  cronos: compoundExports2({ comptroller: '0x8312A8d5d1deC499D00eb28e1a2723b13aA53C1e', cether: '0xf4ff4b8ee660d4276eda17e79094a7cc519e9606', }),},
  {  cronos: compoundExports2({ comptroller: '0x7E0067CEf1e7558daFbaB3B1F8F6Fa75Ff64725f', cether: '0x972173afb7eefb80a0815831b318a643442ad0c1', }),},
]);
