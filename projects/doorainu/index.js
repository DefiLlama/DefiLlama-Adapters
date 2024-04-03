const { masterchefExports } = require('../helper/unknownTokens')

module.exports = masterchefExports({
  chain: 'arbitrum',
  useDefaultCoreAssets: true,
  masterchef: '0xc98d9f2AD12D9813e1f76139b7ba7b84a1d2a878',
  nativeToken: '0xb7ffA0D35597d2e166384fc88Ed746a4c74be001',
})
