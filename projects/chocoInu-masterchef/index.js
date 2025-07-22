const { masterchefExports } = require("../helper/unknownTokens");

module.exports = masterchefExports({
  chain: "shibarium",
  masterchef: "0x100A30e31aa03ed85F0854712a1Dff0880e960BE",
  nativeTokens: ["0xC7cc176b2a098fF7cFd578C9eF0Cc8b1216C8ED1"],
  useDefaultCoreAssets: true,
  poolInfoABI: "function poolInfo(uint256) view returns (address)",
  getToken: (i) => i,
})