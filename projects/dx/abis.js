const getLPAddressFromPresaleRouterV3 = {
  "inputs": [],
  "name": "storedLPAddress",
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const getPresaleDataV3 = {
  "inputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "name": "presales",
  "outputs": [
    {
      "internalType": "bool",
      "name": "exists",
      "type": "bool"
    },
    {
      "internalType": "uint256",
      "name": "createdOn",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "presaleInfoAddr",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "tokenAddress",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "presaleAddress",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "governor",
      "type": "address"
    },
    {
      "internalType": "bool",
      "name": "active",
      "type": "bool"
    },
    {
      "internalType": "uint256",
      "name": "startTime",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "endTime",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "govPercentage",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "uniswapDep",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "uniswapPercentage",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "uniswapRate",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "lp_locked",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const getPresaleOwnerAddressByIdV3 = {
  "inputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "name": "presaleOwners",
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const getPresaleCountPerContractV3 = {
  "inputs": [],
  "name": "getNumberOfPresaleOwners",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const getLockCountPerContractV3 = {
  "inputs": [],
  "name": "lockerNumberOpen",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const getLockerWalletWithIdV3 =  {
  "inputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "name": "LockerRecord",
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const getLockerTokenDataV3 = {
  "inputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "name": "DXLOCKER",
  "outputs": [
    {
      "internalType": "bool",
      "name": "exists",
      "type": "bool"
    },
    {
      "internalType": "bool",
      "name": "locked",
      "type": "bool"
    },
    {
      "internalType": "string",
      "name": "logo",
      "type": "string"
    },
    {
      "internalType": "uint256",
      "name": "lockedAmount",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "lockedTime",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "vestPercentage",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "startTime",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "calcStartTime",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "totalPayouts",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "payoutsLeft",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "vestingPeriod",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "eachPayout",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "tokenAddress",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const getLockerLPDataV3 ={
  "inputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "name": "DXLOCKERLP",
  "outputs": [
    {
      "internalType": "bool",
      "name": "exists",
      "type": "bool"
    },
    {
      "internalType": "bool",
      "name": "locked",
      "type": "bool"
    },
    {
      "internalType": "string",
      "name": "logo",
      "type": "string"
    },
    {
      "internalType": "uint256",
      "name": "lockedAmount",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "lockedTime",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "startTime",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "lpAddress",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const getLockerPerWalletV3 = {
  "inputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "name": "UserLockerCount",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}


const getNumLockedTokens = {
  "inputs": [],
  "name": "getNumLockedTokens",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const lockedTokensLength = {
  "inputs": [],
  "name": "lockedTokensLength",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const getLockedTokenAtIndex =  {
  "inputs": [
    {
      "internalType": "uint256",
      "name": "_index",
      "type": "uint256"
    }
  ],
  "name": "getLockedTokenAtIndex",
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}


const lockedToken = {
  "inputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "name": "lockedTokens",
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}



module.exports = {
  getLPAddressFromPresaleRouterV3,
  getPresaleDataV3,
  getPresaleOwnerAddressByIdV3,
  getPresaleCountPerContractV3,
  getLockerLPDataV3,
  getLockerTokenDataV3,
  getLockerWalletWithIdV3,
  getLockCountPerContractV3,
  getLockerPerWalletV3,
  getLockedTokenAtIndex,
  getNumLockedTokens,
  lockedTokensLength,
  lockedToken
}
