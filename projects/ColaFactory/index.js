const { masterchefExports } = require("../helper/unknownTokens");

module.exports = masterchefExports({
  chain: "pulse",
  masterchef: "0x5Fe423A22d4bFD1caFd6044042f4269Fc930F8dC",
  nativeTokens: ["0x02Dff78fDeDaF86D9dfbe9B3132aA3Ea72Ed1680"],
  useDefaultCoreAssets: true,
  poolInfoABI: "function poolInfo(uint256) view returns (address)",
  getToken: (i) => i,
  blacklistedTokens: ['0x9bd778df9b803a2df1fbe94ca9b5765cdb299a23'],
});
