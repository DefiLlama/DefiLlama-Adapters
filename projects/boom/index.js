const { masterchefExports } = require("../helper/unknownTokens");

const boomTokenAddress = "0xe88Ac56C4dedc973a0a26C062F0F07568dfb23FA"
const boomChefAddress = "0x153b536dB217fD92685833466C51DB91fE4Cd9ab"

module.exports = masterchefExports({ 
  chain: 'polygon', 
  masterchef: boomChefAddress,
  nativeToken: boomTokenAddress,
  useDefaultCoreAssets: true,
  poolInfoABI: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accBoomPerShare)',
})