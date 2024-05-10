module.exports = {
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
    "constant": true
  },
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
          "internalType": "contract IAsset",
          "name": "lpToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "baseAllocPoint",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "lastRewardTimestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "accZilchPerShare",
          "type": "uint256"
        },
        {
          "internalType": "contract IRewarder",
          "name": "rewarder",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "sumOfFactors",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "accZilchPerFactorShare",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "adjustedAllocPoint",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    underlyingToken: {
      "inputs": [],
      "name": "underlyingToken",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
}