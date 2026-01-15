const { masterchefExports } = require("../helper/unknownTokens");

module.exports = masterchefExports({
  chain: "sonic",
  masterchef: "0x51cbd201913dEC2C9714b340fDCf6530399bb89a",
  nativeTokens: ["0x4931CE8f4130a723cC6fF8A0B23B7F33550aB3a4"],
  useDefaultCoreAssets: true,
  poolInfoABI: "function poolInfo(uint256) view returns (address)",
  getToken: (i) => i,
});
