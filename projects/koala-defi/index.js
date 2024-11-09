const { masterchefExports, } = require('../helper/unknownTokens');
const { mergeExports } = require("../helper/utils");

module.exports = mergeExports([
  masterchefExports({
    chain: 'polygon',
    masterchef: '0xf6948f00FC2BA4cDa934C931628B063ed9091019',
    nativeToken: '0x04f2e3ec0642e501220f32fcd9e26e77924929a9',
  }),
  masterchefExports({
    chain: 'bsc',
    masterchef: '0x7b3cA828e189739660310B47fC89B3a3e8A0E564',
    nativeToken: '0xb2ebaa0ad65e9c888008bf10646016f7fcdd73c3',
  })
])