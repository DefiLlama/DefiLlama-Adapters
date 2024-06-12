const { masterchefExports } = require("../helper/unknownTokens");

module.exports = masterchefExports({
  chain: "pulse",
  masterchef: "0x1b9DD75c79Ef7308bC9aD449A9171fC5406403D8",
  nativeTokens: ["0xa39e7837B0c283e7ce07cfA7ca3DeEe58fbcbCd8"],
  useDefaultCoreAssets: true,
  poolInfoABI: "function poolInfo(uint256) view returns (address)",
  getToken: (i) => i,
});