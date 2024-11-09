
module.exports = {
  "version": "0.1.0",
  "name": "rain",
  "instructions": [],
  "accounts": [
    {
      "name": "loan",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "kind",
            "type": {
              "defined": "LoanKind"
            }
          },
          {
            "name": "status",
            "type": {
              "defined": "LoanStatus"
            }
          },
          {
            "name": "borrower",
            "type": "publicKey"
          },
          {
            "name": "lender",
            "type": "publicKey"
          },
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "currency",
            "type": "publicKey"
          },
          {
            "name": "isCustom",
            "type": "bool"
          },
          {
            "name": "isFrozen",
            "type": "bool"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "interest",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "duration",
            "type": "u64"
          },
          {
            "name": "collection",
            "type": "u32"
          },
          {
            "name": "liquidation",
            "type": "u16"
          },
          {
            "name": "marketplace",
            "type": {
              "defined": "Marketplace"
            }
          },
          {
            "name": "sale",
            "type": {
              "defined": "Sale"
            }
          },
          {
            "name": "createdAt",
            "type": "u64"
          },
          {
            "name": "expiredAt",
            "type": "u64"
          },
          {
            "name": "repaidAt",
            "type": "u64"
          },
          {
            "name": "soldAt",
            "type": "u64"
          },
          {
            "name": "liquidatedAt",
            "type": "u64"
          },
          {
            "name": "listing",
            "type": {
              "defined": "Listing"
            }
          },
          {
            "name": "isCompressedLoan",
            "type": "bool"
          },
          {
            "name": "isDefi",
            "type": "bool"
          },
          {
            "name": "collateralAmount",
            "type": "u64"
          },
          {
            "name": "collateralDecimals",
            "type": "u8"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u64",
                5
              ]
            }
          },
          {
            "name": "padding1",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "currency",
            "type": "publicKey"
          },
          {
            "name": "oraclePoolUsd",
            "type": "publicKey"
          },
          {
            "name": "oracleSolUsd",
            "type": "publicKey"
          },
          {
            "name": "status",
            "type": {
              "defined": "PoolStatus"
            }
          },
          {
            "name": "isCompounded",
            "type": "bool"
          },
          {
            "name": "isShared",
            "type": "bool"
          },
          {
            "name": "totalAmount",
            "type": "u64"
          },
          {
            "name": "borrowedAmount",
            "type": "u64"
          },
          {
            "name": "availableAmount",
            "type": "u64"
          },
          {
            "name": "usableAmount",
            "type": "u64"
          },
          {
            "name": "loanCurve",
            "type": {
              "defined": "Curve"
            }
          },
          {
            "name": "mortgageCurve",
            "type": {
              "defined": "Curve"
            }
          },
          {
            "name": "isMortgageEnabled",
            "type": "bool"
          },
          {
            "name": "nftLocked",
            "type": "u64"
          },
          {
            "name": "totalLiquidations",
            "type": "u64"
          },
          {
            "name": "totalLoans",
            "type": "u64"
          },
          {
            "name": "totalMortgages",
            "type": "u64"
          },
          {
            "name": "totalInterest",
            "type": "u64"
          },
          {
            "name": "depositedAt",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "u64"
          },
          {
            "name": "updatedAt",
            "type": "u64"
          },
          {
            "name": "collectionsUpdatedAt",
            "type": "u64"
          },
          {
            "name": "lastLoanAt",
            "type": "u64"
          },
          {
            "name": "lastMortgageAt",
            "type": "u64"
          },
          {
            "name": "conditions",
            "type": {
              "defined": "PoolCondition"
            }
          },
          {
            "name": "liquidation",
            "type": {
              "defined": "PoolLiquidation"
            }
          },
          {
            "name": "whitelist",
            "type": "publicKey"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u64",
                16
              ]
            }
          },
          {
            "name": "collections",
            "type": {
              "array": [
                {
                  "defined": "PoolCollection"
                },
                50
              ]
            }
          }
        ]
      }
    },
  ],
  "types": [
    {
      "name": "LoanKind",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Loan"
          },
          {
            "name": "Mortgage"
          }
        ]
      }
    },
    {
      "name": "LoanStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Ongoing"
          },
          {
            "name": "Repaid"
          },
          {
            "name": "Liquidated"
          },
          {
            "name": "Sold"
          }
        ]
      }
    },
    {
      "name": "Curve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "baseInterest",
            "type": "u16"
          },
          {
            "name": "interestRate",
            "type": "u16"
          },
          {
            "name": "curveRate",
            "type": "u16"
          },
          {
            "name": "curveRateDay",
            "type": "u16"
          },
          {
            "name": "maxDuration",
            "type": "u64"
          },
          {
            "name": "maxAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "PoolCollection",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "collection",
            "type": "u32"
          },
          {
            "name": "collectionLtv",
            "type": "u16"
          },
          {
            "name": "exposure",
            "type": "u16"
          },
          {
            "name": "amountUsed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "PoolCondition",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isEnabled",
            "type": "bool"
          },
          {
            "name": "minAge",
            "type": "u64"
          },
          {
            "name": "minLoan",
            "type": "u64"
          },
          {
            "name": "minVolume",
            "type": "u64"
          },
          {
            "name": "liquidationThreshold",
            "type": "u16"
          },
          {
            "name": "padding1",
            "type": "u16"
          },
          {
            "name": "padding2",
            "type": "u16"
          },
          {
            "name": "padding3",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "PoolLiquidation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "loanLiquidation",
            "type": "u16"
          },
          {
            "name": "mortgageLiquidation",
            "type": "u16"
          },
          {
            "name": "isAutoSellEnabled",
            "type": "bool"
          },
          {
            "name": "percentageMaxLoss",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "PoolStatus",
      "docs": [
        "Pool status enum"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Ready"
          },
          {
            "name": "Disabled"
          }
        ]
      }
    },
    {
      "name": "Marketplace",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "None"
          },
          {
            "name": "Auctionhouse"
          },
          {
            "name": "Solanart"
          },
          {
            "name": "Hyperspace"
          },
          {
            "name": "Yaww"
          },
          {
            "name": "Hadeswap"
          },
          {
            "name": "Rain"
          },
          {
            "name": "TensorswapOrder"
          },
          {
            "name": "TensorswapListing"
          },
          {
            "name": "MagicEden"
          }
        ]
      }
    },
    {
      "name": "Sale",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isForSale",
            "type": "bool"
          },
          {
            "name": "salePrice",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "Listing",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isListed",
            "type": "bool"
          },
          {
            "name": "price",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": []
}