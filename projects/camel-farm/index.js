const ADDRESSES = require('../helper/coreAssets.json')
const { masterchefExports } = require('../helper/unknownTokens')

module.exports = masterchefExports({
  chain: 'arbitrum',
  masterchef: '0xceFDbfaf8E0f5b52F57c435dAD670554aF57EBFF',
  nativeToken: '0xb5734ac76d44bdf32b8dd4331e5bfc3bf9989cda',
  coreAssets: [ADDRESSES.arbitrum.WETH]
})