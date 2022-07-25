module.exports = {
  poolInfo: {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "poolInfo",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "lpToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "allocPoint",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isNFT",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "withdrawFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastRewardTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "accSushiPerShare",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
  },
  poolLength: {
    "inputs": [],
    "name": "poolLength",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
  },
}

