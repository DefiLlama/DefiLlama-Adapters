const { masterchefExports } = require("../helper/unknownTokens");

module.exports = masterchefExports({ 
  chain: 'ethereum', 
  masterchef: '0x32E9BB1E0E03fdaC8131De202Be2f55AceDB349f',
  nativeTokens: ['0x93b743Fb12a2677adB13093f8eA8464A436DA008'],
  useDefaultCoreAssets: true,
  poolInfoABI: {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "poolToken",
    "outputs": [
      {
        "internalType": "contract ERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  getToken: i => i
})

