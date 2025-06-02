const { masterchefExports } = require("../helper/unknownTokens");

module.exports = masterchefExports({
  chain: "base",
  masterchef: "0x0544b381F24eaC255ED1e2Ab2a67f10D2502921a",
  nativeTokens: ["0x614747C53CB1636b4b962E15e1D66D3214621100"],
  useDefaultCoreAssets: true,
  poolInfoABI: "function poolInfo(uint256) view returns (address)",
  getToken: (i) => i,
});