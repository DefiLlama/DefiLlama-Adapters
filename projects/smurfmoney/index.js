const clever = "0x465bc6d1ab26efa74ee75b1e565e896615b39e79";
const mushy = "0x53a5f9d5adc34288b2bff77d27f55cbc297df2b9";

const { masterchefExports, } = require('../helper/unknownTokens');
const { mergeExports } = require('../helper/utils');

module.exports = mergeExports([
  masterchefExports({
    chain: 'fantom',
    masterchef: '0xdD4Ddef5be424a6b5645dF4f5169e3cbA6a975Db',
    nativeTokens: [mushy, clever],
  }),
  masterchefExports({
    chain: 'fantom',
    masterchef: '0x772dEC3e4A9B18e3B2636a70e11e4e0a90F19575',
    nativeTokens: [mushy, clever],
  })
])
