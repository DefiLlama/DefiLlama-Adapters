const fabis = [{
  "name": "allPairs",
  "type": "function",
  "inputs": [
    {
      "name": "pid",
      "type": "felt"
    }
  ],
  "outputs": [
    {
      "name": "res",
      "type": "felt"
    }
  ],
  "stateMutability": "view"
},
{
  "name": "allPairsLength",
  "type": "function",
  "inputs": [],
  "outputs": [
    {
      "name": "res",
      "type": "felt"
    }
  ],
  "stateMutability": "view"
}
]

const pabis = [
  {
    "name": "getToken0",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "res",
        "type": "felt"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "getToken1",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "res",
        "type": "felt"
      }
    ],
    "stateMutability": "view"
  },
  {
      "inputs": [],
      "name": "getReserves",
      "outputs": [
          {
              "name": "reserve0",
              "type": "felt"
          },
          {
              "name": "reserve1",
              "type": "felt"
          },
          {
              "name": "block_timestamp",
              "type": "felt"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "getReserve1",
      "outputs": [
          {
              "name": "res",
              "type": "Uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "getReserve0",
      "outputs": [
          {
              "name": "res",
              "type": "Uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },

]


const factory = {}
const pair = {}
fabis.forEach(i => factory[i.name] = i)
pabis.forEach(i => pair[i.name] = i)

module.exports = {
  factory, pair, fabis, pabis,
}