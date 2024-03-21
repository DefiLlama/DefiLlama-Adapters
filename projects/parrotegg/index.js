const { masterchefExports, } = require('../helper/unknownTokens');
const { mergeExports } = require('../helper/utils');

module.exports = mergeExports([
  masterchefExports({
    chain: 'iotex',
    masterchef: '0x83E7e97C4e92D56c0653f92d9b0c0B70288119b8',
    nativeToken: '0x176cb5113b4885b3a194bd69056ac3fe37a4b95c',
  }),
  masterchefExports({
    chain: 'harmony',
    masterchef: '0xFb15945E38a11450AF5E3FF20355D71Da72FfE8a',
    nativeToken: '0xC36769DFcDF05B2949F206FC34C8870707D33C89',
  }),
  masterchefExports({
    chain: 'arbitrum',
    masterchef: '0x1cCf20F4eE3EFD291267c07268BEcbFDFd192311',
    nativeToken: '0x78055dAA07035Aa5EBC3e5139C281Ce6312E1b22',
  }),
  masterchefExports({
    chain: 'polygon',
    masterchef: '0x34E4cd20F3a4FdC5e42FdB295e5A118D4eEB0b79',
    nativeToken: '0xB63E54F16600b356f6d62dDd43Fca5b43d7c66fd',
  }),
])
