const abi = {
    "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 rewardPerShare)"
  };

const { masterchefExports, } = require('../helper/unknownTokens')

module.exports = masterchefExports({
  chain: 'ethereum',
  masterchef: '0x0De845955E2bF089012F682fE9bC81dD5f11B372',
  nativeToken: '0xf3dcbc6d72a4e1892f7917b7c43b74131df8480e',
  poolInfoABI: abi.poolInfo,
})