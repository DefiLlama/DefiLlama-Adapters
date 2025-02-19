const { masterchefExports } = require('../helper/unknownTokens')

const standardPoolInfoAbi = 'function getPoolInfo(uint256 _pid) external view returns (address lpToken, uint256 _allocPoint)'

module.exports = masterchefExports({
  chain: 'sonic',
  masterchef: '0x392a46162b8dd7E6F1a34E4829043619B1f5a9f3',
  nativeToken: '0xd1F4414c66E5e046635A179143820f4CBf0D3D3b',
  poolInfoABI: standardPoolInfoAbi
})