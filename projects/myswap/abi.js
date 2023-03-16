const allAbi = [
  {
    "name": "Uint256",
    "size": 2,
    "type": "struct",
    "members": [
      {
        "name": "low",
        "type": "felt",
        "offset": 0
      },
      {
        "name": "high",
        "type": "felt",
        "offset": 1
      }
    ]
  },
  {
    "name": "Pool",
    "size": 10,
    "type": "struct",
    "members": [
      {
        "name": "name",
        "type": "felt",
        "offset": 0
      },
      {
        "name": "token_a_address",
        "type": "felt",
        "offset": 1
      },
      {
        "name": "token_a_reserves",
        "type": "Uint256",
        "offset": 2
      },
      {
        "name": "token_b_address",
        "type": "felt",
        "offset": 4
      },
      {
        "name": "token_b_reserves",
        "type": "Uint256",
        "offset": 5
      },
      {
        "name": "fee_percentage",
        "type": "felt",
        "offset": 7
      },
      {
        "name": "cfmm_type",
        "type": "felt",
        "offset": 8
      },
      {
        "name": "liq_token",
        "type": "felt",
        "offset": 9
      }
    ]
  },
  {
    "name": "get_total_number_of_pools",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "num",
        "type": "felt"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "get_pool",
    "type": "function",
    "inputs": [
      {
        "name": "pool_id",
        "type": "felt"
      }
    ],
    "outputs": [
      {
        "name": "pool",
        "type": "Pool"
      }
    ],
    "stateMutability": "view"
  },
]

const factoryAbi = {}
allAbi.forEach(i => factoryAbi[i.name] = i)

module.exports = {
  factoryAbi, allAbi,
}