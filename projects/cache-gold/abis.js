const abis = {};

abis.gramOz = [{ "inputs": [], "name": "getLatestPrice", "outputs": [{ "internalType": "int256", "name": "", "type": "int256" }], "stateMutability": "view", "type": "function" }];

abis.cacheGold = [{
    "constant": true,
    "inputs": [],
    "name": "totalCirculation",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }]

module.exports = abis