const { masterchefExports, } = require('../helper/unknownTokens')

module.exports = masterchefExports({
  chain: 'fantom',
  masterchef: '0x7C36c64811219CF9B797C5D9b264d9E7cdade7a4',
  nativeToken: '0x90E892FED501ae00596448aECF998C88816e5C0F',
  blacklistedTokens: ['0xaae8c712e9a3487e7b89d604181f2d29c4c48735']
})