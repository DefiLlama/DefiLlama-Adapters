const { compoundExports2 } = require('../helper/compound')

module.exports = {
  findora: compoundExports2({ comptroller: '0x3b056De20d662B09f73bDb28Ea6fa7b7aC82259C', cether: '0xbd4eeda5062605f3c3b86039c5f2c5880f9ecd95', blacklistedTokens: ['0x0000000000000000000000000000000000000000']}),
}
