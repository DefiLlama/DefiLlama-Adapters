const poolInfoAbi = 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accCakePerShare)';
const { masterchefExports, } = require('../helper/unknownTokens')

module.exports = masterchefExports({
  chain: 'bsc',
  masterchef: '0x76FCeffFcf5325c6156cA89639b17464ea833ECd',
  nativeToken: '0x7979F6C54ebA05E18Ded44C4F986F49a5De551c2',
  poolInfoABI: poolInfoAbi
})