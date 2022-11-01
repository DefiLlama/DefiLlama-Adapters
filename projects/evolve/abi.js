module.exports = {

  allLendingPools: {
    "constant": true,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "allLendingPools",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  allLendingPoolsLength: {
    "constant": true,
    "inputs": [],
    "name": "allLendingPoolsLength",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  getLendingPool: {
    "constant": true,
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "getLendingPool",
    "outputs": [
      {
        "internalType": "bool",
        "name": "initialized",
        "type": "bool"
      },
      {
        "internalType": "uint24",
        "name": "lendingPoolId",
        "type": "uint24"
      },
      {
        "internalType": "address",
        "name": "collateral",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "borrowable0",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "borrowable1",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  underlying: {
    "constant": true,
    "inputs": [],
    "name": "underlying",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  totalBorrows: {
    "constant": true,
    "inputs": [],
    "name": "totalBorrows",
    "outputs": [
      {
        "internalType": "uint112",
        "name": "",
        "type": "uint112"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
}