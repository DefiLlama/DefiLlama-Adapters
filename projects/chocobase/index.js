const { masterchefExports } = require("../helper/unknownTokens");

module.exports = masterchefExports({
  chain: "base",
  masterchef: "0x03B03cB12C3C9079BD6f1F155BD3348e99692d9b",
  nativeTokens: ["0x6d6080492D0Bd40F1e44cc16791CC1664357f685"],
  useDefaultCoreAssets: true,
  poolInfoABI: "function poolInfo(uint256) view returns (address)",
  getToken: (i) => i,
});