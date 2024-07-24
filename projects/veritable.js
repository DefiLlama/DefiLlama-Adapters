const abi = 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accVRTPerShare)'
const { masterchefExports, } = require('./helper/unknownTokens')

module.exports = masterchefExports({
  chain: 'polygon',
  masterchef: '0xE139E30D5C375C59140DFB6FD3bdC91B9406201c',
  nativeToken: '0x6397835430a5a5f8530F30C412CB217CE3f0943b',
  poolInfoABI: abi
})