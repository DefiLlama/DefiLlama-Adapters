
const address = {
  "internalType": "address",
  "name": "",
  "type": "address"
};

const erc20Address = {
  "internalType": "contract IERC20",
  "name": "",
  "type": "address"
};

module.exports = {
  "LongShortPair.collateralToken": {
    "type": "function",
    "name": "collateralToken",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [erc20Address],
  },

  "LongShortPair.longToken": {
    "type": "function",
    "name": "longToken",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [erc20Address],
  },

  "LongShortPair.shortToken": {
    "type": "function",
    "name": "shortToken",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [erc20Address],
  },

  "UniswapFactory.getPair": {
    "type": "function",
    "name": "getPair",
    "constant": true,
    "stateMutability": "view",
    "inputs": [address, address],
    "outputs": [address],
  }
};