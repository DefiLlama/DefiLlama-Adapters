const getStorageLPLockDataV33 ={
  "inputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "name": "AllLockRecord",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "createdOn",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "lockOwner",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "lockedLPTokens",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "lockTime",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "lpLockContract",
      "type": "address"
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
      "name": "countID",
      "type": "uint256"
    },
    {
      "internalType": "bool",
      "name": "exists",
      "type": "bool"
    },
    {
      "internalType": "address",
      "name": "token0Addr",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "token1Addr",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const getStorageTokenLockDataV33 = {
  inputs: [
    {
      internalType: "uint256",
      name: "",
      type: "uint256",
    },
  ],
  name: "AllLockRecord",
  outputs: [
    {
      internalType: "uint256",
      name: "createdOn",
      type: "uint256",
    },
    {
      internalType: "address",
      name: "lockOwner",
      type: "address",
    },
    {
      internalType: "address",
      name: "lockedTokens",
      type: "address",
    },
    {
      internalType: "uint256",
      name: "lockTime",
      type: "uint256",
    },
    {
      internalType: "address",
      name: "lockContract",
      type: "address",
    },
    {
      internalType: "string",
      name: "logo",
      type: "string",
    },
    {
      internalType: "bool",
      name: "locked",
      type: "bool",
    },
    {
      internalType: "uint256",
      name: "vestCount",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "lockerType",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "countID",
      type: "uint256",
    },
  ],
  stateMutability: "view",
  type: "function",
};

const getStorageLockCountV33 = {
  inputs: [],
  name: "lockerIDCount",
  outputs: [
    {
      internalType: "uint256",
      name: "",
      type: "uint256",
    },
  ],
  stateMutability: "view",
  type: "function",
};

const getLockCountPerContractV3 = {
  inputs: [],
  name: "lockerNumberOpen",
  outputs: [
    {
      internalType: "uint256",
      name: "",
      type: "uint256",
    },
  ],
  stateMutability: "view",
  type: "function",
};

const getLockerWalletWithIdV3 = {
  inputs: [
    {
      internalType: "uint256",
      name: "",
      type: "uint256",
    },
  ],
  name: "LockerRecord",
  outputs: [
    {
      internalType: "address",
      name: "",
      type: "address",
    },
  ],
  stateMutability: "view",
  type: "function",
};

const getLockerTokenDataV3 = {
  inputs: [
    {
      internalType: "address",
      name: "",
      type: "address",
    },
    {
      internalType: "uint256",
      name: "",
      type: "uint256",
    },
  ],
  name: "DXLOCKER",
  outputs: [
    {
      internalType: "bool",
      name: "exists",
      type: "bool",
    },
    {
      internalType: "bool",
      name: "locked",
      type: "bool",
    },
    {
      internalType: "string",
      name: "logo",
      type: "string",
    },
    {
      internalType: "uint256",
      name: "lockedAmount",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "lockedTime",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "vestPercentage",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "startTime",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "calcStartTime",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "totalPayouts",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "payoutsLeft",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "vestingPeriod",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "eachPayout",
      type: "uint256",
    },
    {
      internalType: "address",
      name: "tokenAddress",
      type: "address",
    },
  ],
  stateMutability: "view",
  type: "function",
};

const getLockerLPDataV3 = {
  inputs: [
    {
      internalType: "address",
      name: "",
      type: "address",
    },
    {
      internalType: "uint256",
      name: "",
      type: "uint256",
    },
  ],
  name: "DXLOCKERLP",
  outputs: [
    {
      internalType: "bool",
      name: "exists",
      type: "bool",
    },
    {
      internalType: "bool",
      name: "locked",
      type: "bool",
    },
    {
      internalType: "string",
      name: "logo",
      type: "string",
    },
    {
      internalType: "uint256",
      name: "lockedAmount",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "lockedTime",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "startTime",
      type: "uint256",
    },
    {
      internalType: "address",
      name: "lpAddress",
      type: "address",
    },
  ],
  stateMutability: "view",
  type: "function",
};

const getLockerPerWalletV3 = {
  inputs: [
    {
      internalType: "address",
      name: "",
      type: "address",
    },
  ],
  name: "UserLockerCount",
  outputs: [
    {
      internalType: "uint256",
      name: "",
      type: "uint256",
    },
  ],
  stateMutability: "view",
  type: "function",
};

module.exports = {
  getStorageLPLockDataV33,
  getStorageLockDataV33: getStorageTokenLockDataV33,
  getStorageLockCountV33,
  getLockerLPDataV3,
  getLockerTokenDataV3,
  getLockerWalletWithIdV3,
  getLockCountPerContractV3,
  getLockerPerWalletV3,
};
