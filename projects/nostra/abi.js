const assetToken = [
  {
    "name": "underlyingAsset",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "_underlyingAsset",
        "type": "felt"
      }
    ],
    "stateMutability": "view",
    "customType": "address"
  },
  {
    "name": "totalSupply",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "totalSupply",
        "type": "Uint256"
      }
    ],
    "stateMutability": "view"
  }
]

const assetTokenAbi = {}
assetToken.forEach(i => assetTokenAbi[i.name] = i)

module.exports = {
  assetTokenAbi
}