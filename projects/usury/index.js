const { compoundExports2 } = require('../helper/compound')

module.exports = {
  sonic: compoundExports2({comptroller: '0x3d9E6935D50838108802Dc36A7cf12654420d9A4', cether: '0x248df89019d089689A02c3f9b71658493710D054'}),
  mantle: compoundExports2({comptroller: '0x4DC8333D19dd8CFe927A0E52782d8D2E3073f6b3', cether: '0xC3a41bF1E1F989A19cf555458Af209CBf3B8C97f'}),
}
