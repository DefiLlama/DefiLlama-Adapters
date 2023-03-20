const { masterchefExports } = require('../helper/unknownTokens')

module.exports = masterchefExports({
  chain: 'arbitrum',
  useDefaultCoreAssets: true,
  masterchef: '0xD0834fF6122FF8dcf38E3eB79372C00FAeAFa08B',
  nativeToken: '0x88692aD37c48e8F4c821b71484AE3C2878C2A2C6',
})