const { masterchefExports } = require("../helper/unknownTokens");

module.exports = masterchefExports({ 
  chain: 'ethereum', 
  masterchef: '0x32E9BB1E0E03fdaC8131De202Be2f55AceDB349f',
  nativeTokens: ['0x93b743Fb12a2677adB13093f8eA8464A436DA008'],
  useDefaultCoreAssets: true,
  poolInfoABI: 'function poolToken(uint256) view returns (address)',
  getToken: i => i
})

