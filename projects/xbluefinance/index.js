const { masterchefExports } = require('../helper/unknownTokens')

module.exports = masterchefExports({
  chain: 'arbitrum',
  useDefaultCoreAssets: true,
  masterchef: '0xd139490F63d220CacA960DA9E40Ad59Fc3AdcB15',
  nativeToken: '0x50AA7A13B28EeA97dc6C3f5E8aaa7fE512e7306D',
})