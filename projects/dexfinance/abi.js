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
}


module.exports = {
  ETF_ABI,
}