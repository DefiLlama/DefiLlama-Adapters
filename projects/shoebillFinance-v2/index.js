const { compoundExports2 } = require('../helper/compound')

module.exports = {
  klaytn: compoundExports2({ comptroller: '0xEE3Db1711ef46C04c448Cb9F5A03E64e7aa22814', cether: '0xac6a4566d390a0da085c3d952fb031ab46715bcf'}),
  wemix: compoundExports2({ comptroller: '0xBA5E3f89f57342D94333C682e159e68Ee1Fc64De', cether: '0xD42ad8346d14853EB3D30568B7415cF90C579D83'})
}