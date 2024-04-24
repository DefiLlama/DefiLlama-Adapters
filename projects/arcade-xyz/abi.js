const VAULT_FACTORY_ABI = 'event VaultCreated(address vault,address to)'

const SINGLE_SIDED_STAKING_ABI = [
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [
    {
      "name": "",
      "type": "uint256",
      "internalType": "uint256"
    }
    ],
    "stateMutability": "view"
  }
]

const ARCD_ABI = [
  {
    "inputs":[
      {
        "internalType":"address",
        "name":"account",
        "type":"address"
      }
    ],
    "name":"balanceOf",
    "outputs":[
      {
        "internalType":"uint256",
        "name":"",
        "type":"uint256"
      }
    ],
    "stateMutability":"view",
    "type":"function"
  },
]

module.exports = {
  VAULT_FACTORY_ABI,
  SINGLE_SIDED_STAKING_ABI,
  ARCD_ABI
};
