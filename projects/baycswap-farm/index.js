const { masterchefExports } = require("../helper/unknownTokens");

module.exports = masterchefExports({
  chain: "apechain",
  masterchef: "0xf0183A03da8a5D6246CFDf5433beD30BcB40960a",
  nativeTokens: ["0x3Ee9074E93c364c7040d8D1498Bb1c36207Edb2B"],
  useDefaultCoreAssets: true,
  poolInfoABI: "function poolInfo(uint256) view returns (address)",
  getToken: (i) => i,
});