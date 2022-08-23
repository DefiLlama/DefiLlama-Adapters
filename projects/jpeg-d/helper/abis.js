const VAULT_ABI = [{
    "inputs": [],
    "name": "totalPositions",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },{
    "inputs": [],
    "name": "floorOracle",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
},{
  "inputs": [
    {
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }
  ],
  "name": "nftTypeValueETH",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}];

const PRICEORACLE_ABI = [{
    "inputs": [],
    "name": "latestAnswer",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
}];

const CURVE_POOL_ABI = [{
  "stateMutability": "view",
  "type": "function",
  "name": "get_virtual_price",
  "inputs": [],
  "outputs": [{
      "name": "",
      "type": "uint256"
  }]
}];

module.exports = {
    CURVE_POOL_ABI,
    VAULT_ABI,
    PRICEORACLE_ABI
};
