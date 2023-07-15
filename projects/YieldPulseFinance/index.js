const { masterchefExports } = require("../helper/unknownTokens");

module.exports = masterchefExports({
  chain: "pulse",
  masterchef: "0xc9649cd27cFe8D74a47D711e04fEF3AbC4B56bae",
  nativeTokens: ["0xDd40a166b43c0b95F1248c9A5AFFD7A166f1526a"],
  useDefaultCoreAssets: true,
  poolInfoABI: "function poolInfo(uint256) view returns (address)",
  getToken: (i) => i,
});
