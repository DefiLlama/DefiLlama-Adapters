module.exports = {
  poolLength: {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "name": "poolLength",
    "inputs": [],
    "constant": true,
    "signature": "0x081e3eda"
  },
  poolInfo: {
    "name": "poolInfo",
    "type": "function",
    "outputs": [
      {
        "type": "address",
        "internalType": "contract IERC20",
        "name": "want"
      },
      {
        "type": "address",
        "internalType": "address",
        "name": "strat"
      }
    ],
    "stateMutability": "view",
    "inputs": [
      {
        "type": "uint256",
        "name": "",
        "internalType": "uint256"
      }
    ],
    "constant": true,
    "signature": "0x1526fe27"
  },
  wantLockedTotal: {
    "inputs": [],
    "name": "wantLockedTotal",
    "stateMutability": "view",
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "type": "function"
  },
}