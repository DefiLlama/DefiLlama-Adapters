const { masterchefExports } = require("../helper/unknownTokens");

module.exports = masterchefExports({
  chain: "pulse",
  masterchef: "0xAc6fBc06C8c0477ba8fc117adb52881c1Cc580dA",
  nativeTokens: ["0x9F8182aD65c53Fd78bd07648a1b3DDcB675c6772"],
  useDefaultCoreAssets: true,
  poolInfoABI: "function poolInfo(uint256) view returns (address)",
  getToken: (i) => i,
});
