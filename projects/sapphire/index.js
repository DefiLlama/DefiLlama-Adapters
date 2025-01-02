const { masterchefExports, } = require('../helper/unknownTokens');
const { mergeExports } = require('../helper/utils');

module.exports = mergeExports([
  masterchefExports({
    chain: 'fantom',
    masterchef: '0x5A3b5A572789B87755Fa7720A4Fae36e2e2D3b35',
    nativeToken: '0xfa7d8c3CccC90c07c53feE45A7a333CEC40B441B',
  }),
  masterchefExports({
    chain: 'fantom',
    masterchef: '0xD1b96929AceDFa7a2920b5409D0c5636b89dcD85',
    nativeToken: '0xB063862a72d234730654c0577C188452424CF53c',
  }),
])
