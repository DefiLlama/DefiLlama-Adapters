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

const LP_PAIR_ABI = [
  {
    "constant":true,
    "inputs":[],
    "name":"getReserves",
    "outputs":[
      {
        "internalType":"uint112",
        "name":"_reserve0",
        "type":"uint112"
      },
      {
        "internalType":"uint112",
        "name":"_reserve1",
        "type":"uint112"
      },
      {
        "internalType":"uint32",
        "name":"_blockTimestampLast",
        "type":"uint32"
      }
    ],
    "payable":false,
    "stateMutability":"view",
    "type":"function"
  },
]

module.exports = {
  VAULT_FACTORY_ABI,
  SINGLE_SIDED_STAKING_ABI,
  ARCD_ABI,
  LP_PAIR_ABI
};
