module.exports = {

  apGetAddress: {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "getAddress",
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
  getPriceManager: {
    "inputs": [],
    "name": "priceManager",
    "outputs": [
      {
        "internalType": "contract ITangiblePriceManager",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  getCategories: {
    "inputs": [],
    "name": "getCategories",
    "outputs": [
      {
        "internalType": "contract ITangibleNFT[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  getTreasuryValue: {
    "inputs": [],
    "name": "getTreasuryValue",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "stable",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "usdr",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "rwa",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tngbl",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "liquidity",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "tngbl",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "underlying",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "liquidity",
                "type": "uint256"
              }
            ],
            "internalType": "struct ITreasury.TNGBLLiquidity",
            "name": "tngblLiquidity",
            "type": "tuple"
          },
          {
            "internalType": "uint256",
            "name": "debt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "total",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "rwaVaults",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "rwaEscrow",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "rwaValueNotLatest",
            "type": "bool"
          }
        ],
        "internalType": "struct ITreasury.TreasuryValue",
        "name": "value",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  getTotalSupply: {
    "inputs": [],
    "name": "totalSupply",
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
  getTokenByIndex: {
    "inputs": [
        {
            "internalType": "uint256",
            "name": "index",
            "type": "uint256"
        }
    ],
    "name": "tokenByIndex",
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
  getTnftCustody: {
    "inputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "name": "tnftCustody",
    "outputs": [
        {
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  getItemPriceBatchTokenIds: {
    "inputs": [
      {
        "internalType": "contract ITangibleNFT",
        "name": "nft",
        "type": "address"
      },
      {
        "internalType": "contract IERC20Metadata",
        "name": "paymentUSDToken",
        "type": "address"
      },
      {
        "internalType": "uint256[]",
        "name": "tokenIds",
        "type": "uint256[]"
      }
    ],
    "name": "itemPriceBatchTokenIds",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "weSellAt",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "weSellAtStock",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "weBuyAt",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "weBuyAtStock",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "lockedAmount",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
}