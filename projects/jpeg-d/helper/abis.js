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
    "name": "nftValueProvider",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
}];

const VALUE_PROVIDER_ABI = [{
  "inputs": [],
  "name": "getFloorETH",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}]

module.exports = {
    VAULT_ABI,
    VALUE_PROVIDER_ABI
};
