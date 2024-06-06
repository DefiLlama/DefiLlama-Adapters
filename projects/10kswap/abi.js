const fabis = [{
  "name": "allPairs",
  "type": "function",
  "inputs": [
    {
      "name": "index",
      "type": "felt"
    }
  ],
  "outputs": [
    {
      "name": "pair",
      "type": "felt"
    }
  ],
  "stateMutability": "view",
  "customType": "address"
},
{
  "name": "allPairsLength",
  "type": "function",
  "inputs": [],
  "outputs": [
    {
      "name": "length",
      "type": "felt"
    }
  ],
  "stateMutability": "view",
  "customType": "Uint256"
}
]

const pabis = [
  {
    "name": "token0",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "token0",
        "type": "felt"
      }
    ],
    "stateMutability": "view",
    "customType": "address"
  },
  {
    "name": "token1",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "token1",
        "type": "felt"
      }
    ],
    "stateMutability": "view",
    "customType": "address"
  },
  {
    "name": "getReserves",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "_reserve0",
        "type": "felt"
      },
      {
        "name": "_reserve1",
        "type": "felt"
      },
      {
        "name": "blockTimestampLast",
        "type": "felt"
      }
    ],
    "stateMutability": "view"
  },
]


const factory = {}
const pair = {}
fabis.forEach(i => factory[i.name] = i)
pabis.forEach(i => pair[i.name] = i)

module.exports = {
  factory, pair, fabis, pabis,
}