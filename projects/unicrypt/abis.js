
const getNumLockedTokens = "uint256:getNumLockedTokens"

const lockedTokensLength = "uint256:lockedTokensLength"

const getLockedTokenAtIndex =  {
  "inputs": [
    {
      "internalType": "uint256",
      "name": "_index",
      "type": "uint256"
    }
  ],
  "name": "getLockedTokenAtIndex",
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}


const lockedToken = {
  "inputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "name": "lockedTokens",
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}



module.exports = {
  getLockedTokenAtIndex,
  getNumLockedTokens,
  lockedTokensLength,
  lockedToken
}