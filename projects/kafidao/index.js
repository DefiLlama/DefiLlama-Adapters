const { masterchefExports  } = require("../helper/unknownTokens");

const chef = "0x58a8E42C071b9C9d049F261E75DE5568Ef81a427"
module.exports = masterchefExports({ chain: 'kava', masterchef: chef, useDefaultCoreAssets: true, nativeToken: '0x254B63C7481A16bC4080f0Ab369320004f79Cca3', poolInfoABI: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accKfdPerShare)' })