const { compoundExports2 } = require('../helper/compound');

module.exports = {
  telos: compoundExports2({
    comptroller: '0x19646a04BfDcf3553Adc8fAAf8B16D76EC41E494',
    cether: '0x7d94D2F6f91ED5ED0104D89B3D263026D990Ac5f',
  }),
  era: compoundExports2({
    comptroller: '0x23848c28Af1C3AA7B999fA57e6b6E8599C17F3f2',
    cether: '0xC5db68F30D21cBe0C9Eac7BE5eA83468d69297e6',
  })
}; 
