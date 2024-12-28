const { compoundExports2 } = require('../helper/compound')

module.exports = {
  rsk: compoundExports2({ comptroller: "0x962308fEf8edFaDD705384840e7701F8f39eD0c0", cether: '0x0aEaDb9d4C6a80462a47E87e76e487fa8b9A37d7', blacklistedTokens: ['0xd2ec53e8dd00d204d3d9313af5474eb9f5188ef6']}),
}