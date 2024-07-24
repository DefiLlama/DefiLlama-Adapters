const fabis = [
  {
      "inputs": [],
      "name": "get_all_pairs",
      "outputs": [
          {
              "name": "all_pairs_len",
              "type": "felt"
          },
          {
              "name": "all_pairs",
              "type": "felt*"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  }
]

const pabis = [
  {
      "inputs": [],
      "name": "token0",
      "outputs": [
          {
              "name": "address",
              "type": "felt"
          }
      ],
      "stateMutability": "view",
      "type": "function",
      "customType": "address"
  },
  {
      "inputs": [],
      "name": "token1",
      "outputs": [
          {
              "name": "address",
              "type": "felt"
          }
      ],
      "stateMutability": "view",
      "type": "function",
      "customType": "address"
  },
  {
      "inputs": [],
      "name": "get_reserves",
      "outputs": [
          {
              "name": "reserve0",
              "type": "Uint256"
          },
          {
              "name": "block_timestamp_last",
              "type": "felt"
          },
          {
              "name": "reserve1",
              "type": "Uint256"
          },
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