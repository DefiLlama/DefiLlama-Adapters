module.exports = {
  penPoolsData: {
    "inputs": [],
    "name": "penPoolsData",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "id",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "stakingAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "stakedTotalSupply",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalSupply",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "id",
                "type": "address"
              },
              {
                "internalType": "string",
                "name": "symbol",
                "type": "string"
              },
              {
                "internalType": "bool",
                "name": "stable",
                "type": "bool"
              },
              {
                "internalType": "address",
                "name": "token0Address",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "token1Address",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "gaugeAddress",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "bribeAddress",
                "type": "address"
              },
              {
                "internalType": "address[]",
                "name": "bribeTokensAddresses",
                "type": "address[]"
              },
              {
                "internalType": "address",
                "name": "fees",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "totalSupply",
                "type": "uint256"
              }
            ],
            "internalType": "struct IDystopiaLens.Pool",
            "name": "poolData",
            "type": "tuple"
          }
        ],
        "internalType": "struct PenLens.PenPoolData[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  poolsReservesInfo: {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "_poolsAddresses",
        "type": "address[]"
      }
    ],
    "name": "poolsReservesInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "id",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token0Address",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token1Address",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "token0Reserve",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "token1Reserve",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "token0Decimals",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "token1Decimals",
            "type": "uint8"
          }
        ],
        "internalType": "struct IDystopiaLens.PoolReserveData[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  locked: {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "locked",
    "outputs": [
      { "internalType": "int128", "name": "amount", "type": "int128" },
      { "internalType": "uint256", "name": "end", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
}