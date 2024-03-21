const { masterchefExports } = require("../helper/unknownTokens");
const { mergeExports } = require("../helper/utils");
const poolInfoABI = "function poolSettingInfo(uint256) view returns (address lpToken, address tokenAddr, address projectAddr, uint256 tokenAmount, uint256 startBlock, uint256 endBlock, uint256 tokenPerBlock, uint256 tokenBonusEndBlock, uint256 tokenBonusMultipler)"
module.exports =  mergeExports([
  masterchefExports({
    chain: 'ethereum',
    masterchef: '0xdA842fad0BDb105c88399e845aD4D00dE3AEb911',
    nativeToken: '0x74159651a992952e2bf340d7628459aa4593fc05',
    poolInfoABI,
  }),
  masterchefExports({
    chain: 'bsc',
    masterchef: '0x3F4c79EB1220BeBBf5eF4B3e7c59E5cf38200b62',
    nativeToken: '0xdFF8cb622790b7F92686c722b02CaB55592f152C',
    poolInfoABI,
  })
])