const abi = [
  {
    "name": "get_all_lptoken_addresses",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "array_len",
        "type": "felt"
      },
      {
        "name": "array",
        "type": "felt*"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "get_underlying_token_address",
    "type": "function",
    "inputs": [
      {
        "name": "lptoken_address",
        "type": "felt"
      }
    ],
    "outputs": [
      {
        "name": "underlying_token_address_",
        "type": "felt"
      }
    ],
    "stateMutability": "view"
  },
];

const objAbi = {};

abi.forEach((i) => (objAbi[i.name] = i));

module.exports = objAbi;
