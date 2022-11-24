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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_nftIndex",
        "type": "uint256"
      }
    ],
    "name": "getNFTValueETH",
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

module.exports = {
    VAULT_ABI
};
