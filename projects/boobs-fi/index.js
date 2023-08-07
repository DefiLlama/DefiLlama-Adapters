const { masterchefExports } = require("../helper/unknownTokens");

module.exports = masterchefExports({
  chain: "base",
  masterchef: "0xF40E05313592008Def7B7e247fbe1177aE902c5A",
  nativeTokens: ["0x66b70221b22925c4663C46cd15f2f2EaaC822CEB"],
  useDefaultCoreAssets: true,
  poolInfoABI: "function poolInfo(uint256) view returns (address)",
  getToken: (i) => i,
});