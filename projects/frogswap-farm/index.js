const { masterchefExports } = require("../helper/unknownTokens");

module.exports = masterchefExports({
  chain: "degen",
  masterchef: "0xaB42EE05ceb48AC8f4d5782E4512D987694802b9",
  nativeTokens: ["0x7D4F462895AD2A6856cb6e94055B841C3cA55987"],
  useDefaultCoreAssets: true,
  poolInfoABI: "function poolInfo(uint256) view returns (address)",
  getToken: (i) => i,
});