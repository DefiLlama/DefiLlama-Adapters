module.exports = {
  getTotalLockCount: {
    "inputs": [],
    "name": "getTotalLockCount",
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
  getLock: {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getLock",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lockDate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "unlockDate",
            "type": "uint256"
          }
        ],
        "internalType": "struct PinkLock.Lock",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  getLockAt: {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getLockAt",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lockDate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tgeDate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tgeBps",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "cycle",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "cycleBps",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "unlockedAmount",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          }
        ],
        "internalType": "struct PinkLock02.Lock",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
}