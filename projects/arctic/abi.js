module.exports = {
  liquidities: {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "liquidities",
    "outputs": [
      {
        "internalType": "int24",
        "name": "leftPt",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "rightPt",
        "type": "int24"
      },
      {
        "internalType": "uint128",
        "name": "liquidity",
        "type": "uint128"
      },
      {
        "internalType": "uint256",
        "name": "lastFeeScaleX_128",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastFeeScaleY_128",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "remainTokenX",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "remainTokenY",
        "type": "uint256"
      },
      {
        "internalType": "uint128",
        "name": "poolId",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  liquidityNum: {
    "inputs": [],
    "name": "liquidityNum",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  pool: {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenX",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "tokenY",
        "type": "address"
      },
      {
        "internalType": "uint24",
        "name": "fee",
        "type": "uint24"
      }
    ],
    "name": "pool",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  poolMetas: {
    "inputs": [
      {
        "internalType": "uint128",
        "name": "",
        "type": "uint128"
      }
    ],
    "name": "poolMetas",
    "outputs": [
      {
        "internalType": "address",
        "name": "tokenX",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "tokenY",
        "type": "address"
      },
      {
        "internalType": "uint24",
        "name": "fee",
        "type": "uint24"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
}