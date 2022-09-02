module.exports = {
  getCurrentPool: {
    "constant": true,
    "inputs": [],
    "name": "getCurrentPool",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "_reserve0",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_reserve1",
        "type": "uint256"
      },
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  tokenA: {
    "constant": true,
    "inputs": [],
    "name": "tokenA",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  tokenB: {
    "constant": true,
    "inputs": [],
    "name": "tokenB",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
}