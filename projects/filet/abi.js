const filetFVMAbi = {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "minePoolMap",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "expireType",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "actionType",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "canSell",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "minerList",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "stakingPrice",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tokenRate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "FILRate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tokenPrecision",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "miniPurchaseAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "hasSoldOutToken",
            "type": "uint256"
          }
        ],
        "internalType": "struct FiletContractStorage.minePool",
        "name": "mPool",
        "type": "tuple"
      },
      {
        "internalType": "bool",
        "name": "isEntity",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }

  const filetBSCAbi = {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "minePoolMap",
    "outputs": [
      {
        "components": [
          {
            "internalType": "contract IERC20",
            "name": "tokenInterface",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "expireType",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "actionType",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "canSell",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "canNotSell",
                "type": "uint256"
              }
            ],
            "internalType": "struct StakingCon.maxMiningPowerType",
            "name": "maxMiningPower",
            "type": "tuple"
          },
          {
            "internalType": "address",
            "name": "earlyRedeemFundAccount",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "redeemFundAccount",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "minerAccount",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "stakingPrice",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tokenRate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "FILRate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tokenPrecision",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recievePaymentAccount",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "miniPurchaseAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "hasSoldOutToken",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lockInterval",
            "type": "uint256"
          },
          {
            "internalType": "uint256[]",
            "name": "poolThredhold",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256[]",
            "name": "serviceFeePercent",
            "type": "uint256[]"
          }
        ],
        "internalType": "struct StakingCon.minePool",
        "name": "mPool",
        "type": "tuple"
      },
      {
        "internalType": "bool",
        "name": "isEntity",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }

  const FiletBSCCurrentAbi= 
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "minePoolMap",
    "outputs": [
      {
        "components": [
          {
            "internalType": "contract IERC20",
            "name": "tokenInterface",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "expireType",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "actionType",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "canSell",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "canNotSell",
                "type": "uint256"
              }
            ],
            "internalType": "struct StakingCon.maxMiningPowerType",
            "name": "maxMiningPower",
            "type": "tuple"
          },
          {
            "internalType": "address",
            "name": "earlyRedeemFundAccount",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "redeemFundAccount",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "profitFundAccount",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "minerAccount",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "stakingPrice",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tokenRate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "FILRate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tokenPrecision",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recievePaymentAccount",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "miniPurchaseAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxPurchaseAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "hasSoldOutToken",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lockInterval",
            "type": "uint256"
          },
          {
            "internalType": "uint256[]",
            "name": "poolThredhold",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256[]",
            "name": "serviceFeePercent",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256",
            "name": "lendhubExtraRatio",
            "type": "uint256"
          }
        ],
        "internalType": "struct StakingCon.minePool",
        "name": "mPool",
        "type": "tuple"
      },
      {
        "internalType": "bool",
        "name": "isEntity",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }

  
  module.exports = {
    filetFVMAbi,filetBSCAbi,FiletBSCCurrentAbi
  }