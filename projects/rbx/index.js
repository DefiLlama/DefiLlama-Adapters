
const { mergeExports } = require('../helper/utils');
const { masterchefExports } = require('../helper/unknownTokens');

module.exports = mergeExports([
  masterchefExports({
    chain: 'bsc',
    masterchef: '0x864d434308997e9648838d23f3eedf5d0fd17bea',
    blacklistedTokens: [
      '0xa9639160481b625ba43677be753e0a70bf58c647',
    ],
    nativeToken: '0xace3574b8b054e074473a9bd002e5dc6dd3dff1b',
  }),
  masterchefExports({
    chain: 'ethereum',
    masterchef: '0x50b641caab809c1853be334246ac951faccc49b0',
    nativeToken: '0x8254e26e453EB5aBd29B3c37AC9E8Da32E5d3299',
  })
])