const ETF_ABI = {
  'getCurrentTokens': {
    "inputs": [],
    "name": "getCurrentTokens",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "tokens",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  'getBalance': {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "getBalance",
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
  'decimals': {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
}

const ETF_ORACLE_ABI = {
  'computeAverageTokenPrices': {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "tokens",
        "type": "address[]"
      },
      {
        "internalType": "uint256",
        "name": "minTimeElapsed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxTimeElapsed",
        "type": "uint256"
      }
    ],
    "name": "computeAverageTokenPrices",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint224",
            "name": "_x",
            "type": "uint224"
          }
        ],
        "internalType": "struct FixedPoint.uq112x112[]",
        "name": "averagePrices",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
}


module.exports = {
  ETF_ABI,
  ETF_ORACLE_ABI
}