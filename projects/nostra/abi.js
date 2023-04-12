const assetToken = [
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
      "data": [
        {
          "name": "previousOwner",
          "type": "felt"
        },
        {
          "name": "newOwner",
          "type": "felt"
        }
      ],
      "keys": [],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "data": [
        {
          "name": "from_",
          "type": "felt"
        },
        {
          "name": "to",
          "type": "felt"
        },
        {
          "name": "value",
          "type": "Uint256"
        }
      ],
      "keys": [],
      "name": "Transfer",
      "type": "event"
    },
    {
      "data": [
        {
          "name": "owner",
          "type": "felt"
        },
        {
          "name": "spender",
          "type": "felt"
        },
        {
          "name": "value",
          "type": "Uint256"
        }
      ],
      "keys": [],
      "name": "Approval",
      "type": "event"
    },
    {
      "data": [
        {
          "name": "user",
          "type": "felt"
        },
        {
          "name": "amount",
          "type": "Uint256"
        }
      ],
      "keys": [],
      "name": "Mint",
      "type": "event"
    },
    {
      "data": [
        {
          "name": "user",
          "type": "felt"
        },
        {
          "name": "amount",
          "type": "Uint256"
        }
      ],
      "keys": [],
      "name": "Burn",
      "type": "event"
    },
    {
      "name": "debtToken",
      "type": "function",
      "inputs": [],
      "outputs": [
        {
          "name": "_debtToken",
          "type": "felt"
        }
      ],
      "stateMutability": "view"
    },
    {
      "name": "cdpManager",
      "type": "function",
      "inputs": [],
      "outputs": [
        {
          "name": "_cdpManager",
          "type": "felt"
        }
      ],
      "stateMutability": "view"
    },
    {
      "name": "underlyingAsset",
      "type": "function",
      "inputs": [],
      "outputs": [
        {
          "name": "_underlyingAsset",
          "type": "felt"
        }
      ],
      "stateMutability": "view"
    },
    {
      "name": "name",
      "type": "function",
      "inputs": [],
      "outputs": [
        {
          "name": "name",
          "type": "felt"
        }
      ],
      "stateMutability": "view"
    },
    {
      "name": "symbol",
      "type": "function",
      "inputs": [],
      "outputs": [
        {
          "name": "symbol",
          "type": "felt"
        }
      ],
      "stateMutability": "view"
    },
    {
      "name": "totalSupply",
      "type": "function",
      "inputs": [],
      "outputs": [
        {
          "name": "totalSupply",
          "type": "Uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "name": "scaledTotalSupply",
      "type": "function",
      "inputs": [],
      "outputs": [
        {
          "name": "totalSupply",
          "type": "Uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "name": "decimals",
      "type": "function",
      "inputs": [],
      "outputs": [
        {
          "name": "decimals",
          "type": "felt"
        }
      ],
      "stateMutability": "view"
    },
    {
      "name": "balanceOf",
      "type": "function",
      "inputs": [
        {
          "name": "account",
          "type": "felt"
        }
      ],
      "outputs": [
        {
          "name": "balance",
          "type": "Uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "name": "scaledBalanceOf",
      "type": "function",
      "inputs": [
        {
          "name": "account",
          "type": "felt"
        }
      ],
      "outputs": [
        {
          "name": "balance",
          "type": "Uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "name": "allowance",
      "type": "function",
      "inputs": [
        {
          "name": "owner",
          "type": "felt"
        },
        {
          "name": "spender",
          "type": "felt"
        }
      ],
      "outputs": [
        {
          "name": "remaining",
          "type": "Uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "name": "getTokenIndex",
      "type": "function",
      "inputs": [],
      "outputs": [
        {
          "name": "tokenIndex",
          "type": "Uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "name": "isCollateral",
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
      "name": "getTotalSupplyCap",
      "type": "function",
      "inputs": [],
      "outputs": [
        {
          "name": "totalSupplyCap",
          "type": "Uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "name": "isBurnable",
      "type": "function",
      "inputs": [],
      "outputs": [
        {
          "name": "isBurnable",
          "type": "felt"
        }
      ],
      "stateMutability": "view"
    },
    {
      "name": "owner",
      "type": "function",
      "inputs": [],
      "outputs": [
        {
          "name": "owner",
          "type": "felt"
        }
      ],
      "stateMutability": "view"
    },
    {
      "name": "getLimitMock",
      "type": "function",
      "inputs": [],
      "outputs": [
        {
          "name": "limitMock",
          "type": "felt"
        }
      ],
      "stateMutability": "view"
    },
    {
      "name": "constructor",
      "type": "constructor",
      "inputs": [
        {
          "name": "name",
          "type": "felt"
        },
        {
          "name": "symbol",
          "type": "felt"
        },
        {
          "name": "cdpManager",
          "type": "felt"
        },
        {
          "name": "isCollateral",
          "type": "felt"
        },
        {
          "name": "interestRateModel",
          "type": "felt"
        },
        {
          "name": "debtToken",
          "type": "felt"
        },
        {
          "name": "owner",
          "type": "felt"
        }
      ],
      "outputs": []
    },
    {
      "name": "transfer",
      "type": "function",
      "inputs": [
        {
          "name": "recipient",
          "type": "felt"
        },
        {
          "name": "amount",
          "type": "Uint256"
        }
      ],
      "outputs": [
        {
          "name": "success",
          "type": "felt"
        }
      ]
    },
    {
      "name": "transferFrom",
      "type": "function",
      "inputs": [
        {
          "name": "sender",
          "type": "felt"
        },
        {
          "name": "recipient",
          "type": "felt"
        },
        {
          "name": "amount",
          "type": "Uint256"
        }
      ],
      "outputs": [
        {
          "name": "success",
          "type": "felt"
        }
      ]
    },
    {
      "name": "uncheckedTransferFrom",
      "type": "function",
      "inputs": [
        {
          "name": "from_",
          "type": "felt"
        },
        {
          "name": "to",
          "type": "felt"
        },
        {
          "name": "amount",
          "type": "Uint256"
        }
      ],
      "outputs": [
        {
          "name": "success",
          "type": "felt"
        }
      ]
    },
    {
      "name": "approve",
      "type": "function",
      "inputs": [
        {
          "name": "spender",
          "type": "felt"
        },
        {
          "name": "amount",
          "type": "Uint256"
        }
      ],
      "outputs": [
        {
          "name": "success",
          "type": "felt"
        }
      ]
    },
    {
      "name": "increaseAllowance",
      "type": "function",
      "inputs": [
        {
          "name": "spender",
          "type": "felt"
        },
        {
          "name": "added_value",
          "type": "Uint256"
        }
      ],
      "outputs": [
        {
          "name": "success",
          "type": "felt"
        }
      ]
    },
    {
      "name": "decreaseAllowance",
      "type": "function",
      "inputs": [
        {
          "name": "spender",
          "type": "felt"
        },
        {
          "name": "subtracted_value",
          "type": "Uint256"
        }
      ],
      "outputs": [
        {
          "name": "success",
          "type": "felt"
        }
      ]
    },
    {
      "name": "approveFromSubAccount",
      "type": "function",
      "inputs": [
        {
          "name": "callerSubAccount",
          "type": "felt"
        },
        {
          "name": "spender",
          "type": "felt"
        },
        {
          "name": "amount",
          "type": "Uint256"
        }
      ],
      "outputs": [
        {
          "name": "success",
          "type": "felt"
        }
      ]
    },
    {
      "name": "increaseAllowanceFromSubAccount",
      "type": "function",
      "inputs": [
        {
          "name": "callerSubAccount",
          "type": "felt"
        },
        {
          "name": "spender",
          "type": "felt"
        },
        {
          "name": "added_value",
          "type": "Uint256"
        }
      ],
      "outputs": [
        {
          "name": "success",
          "type": "felt"
        }
      ]
    },
    {
      "name": "decreaseAllowanceFromSubAccount",
      "type": "function",
      "inputs": [
        {
          "name": "callerSubAccount",
          "type": "felt"
        },
        {
          "name": "spender",
          "type": "felt"
        },
        {
          "name": "subtracted_value",
          "type": "Uint256"
        }
      ],
      "outputs": [
        {
          "name": "success",
          "type": "felt"
        }
      ]
    },
    {
      "name": "mintFees",
      "type": "function",
      "inputs": [
        {
          "name": "recipient",
          "type": "felt"
        },
        {
          "name": "amount",
          "type": "Uint256"
        }
      ],
      "outputs": []
    },
    {
      "name": "mint",
      "type": "function",
      "inputs": [
        {
          "name": "to",
          "type": "felt"
        },
        {
          "name": "amount",
          "type": "Uint256"
        }
      ],
      "outputs": []
    },
    {
      "name": "burn",
      "type": "function",
      "inputs": [
        {
          "name": "burnFrom",
          "type": "felt"
        },
        {
          "name": "to",
          "type": "felt"
        },
        {
          "name": "amount",
          "type": "Uint256"
        }
      ],
      "outputs": [
        {
          "name": "actualAmountBurned",
          "type": "Uint256"
        }
      ]
    },
    {
      "name": "setTotalSupplyCap",
      "type": "function",
      "inputs": [
        {
          "name": "totalSupplyCap",
          "type": "Uint256"
        }
      ],
      "outputs": []
    },
    {
      "name": "setIsBurnable",
      "type": "function",
      "inputs": [
        {
          "name": "isBurnable",
          "type": "felt"
        }
      ],
      "outputs": []
    },
    {
      "name": "transferOwnership",
      "type": "function",
      "inputs": [
        {
          "name": "newOwner",
          "type": "felt"
        }
      ],
      "outputs": []
    },
    {
      "name": "setLimitMock",
      "type": "function",
      "inputs": [
        {
          "name": "limitMock",
          "type": "felt"
        }
      ],
      "outputs": []
    }
] 

const assetTokenAbi = {}
assetToken.forEach(i => assetTokenAbi[i.name] = i)

module.exports = {
    assetTokenAbi
}