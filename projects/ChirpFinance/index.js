const { masterchefExports } = require("../helper/unknownTokens");

module.exports = masterchefExports({
  chain: "pulse",
  masterchef: "0x8d1e3458dA9E8a685732322D435178E790486651",
  nativeTokens: ["0xCa66B54a8A4AD9a231DD70d3605D1ff6aE95d427"],
  useDefaultCoreAssets: true,
  poolInfoABI: "function poolInfo(uint256) view returns (address)",
  getToken: (i) => i,
});
