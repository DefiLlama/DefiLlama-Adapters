const { masterchefExports } = require("../helper/unknownTokens");

module.exports = masterchefExports({
  chain: "pulse",
  masterchef: "0xca3E704Bd09B979170D76d34880c7A72fda51B63",
  nativeTokens: ["0xece11C704F38FF38520667AeCDd7f53eA82F60F5"],
  useDefaultCoreAssets: true,
  poolInfoABI: "function poolInfo(uint256) view returns (address)",
  getToken: (i) => i,
});
