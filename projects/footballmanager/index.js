const { masterchefExports, } = require("../helper/unknownTokens")

module.exports = masterchefExports({
  chain: 'arbitrum',
  masterchef: '0x7c9a900a82a252d833ebc222421d6e13dcc09269',
  nativeToken: '0xBFCAd87Eb74E5855D72808aBa3d7DD2d790FFEfD',
  useDefaultCoreAssets: true,
  poolInfoABI: "function poolInfo(uint256) view returns (address lpToken, uint256, uint256, uint256)"
})

module.exports = {
  arbitrum: { 
    tvl: () => 0
  }
}