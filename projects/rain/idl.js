
module.exports = {
  "version": "0.1.0",
  "name": "rain",
  "instructions": [],
  "accounts": [
    {
      "name": "assetManager",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "currencyIn",
            "type": "publicKey"
          },
          {
            "name": "currencyOut",
            "type": "publicKey"
          },
          {
            "name": "pythInFeed",
            "type": "publicKey"
          },
          {
            "name": "pythOutFeed",
            "type": "publicKey"
          },
          {
            "name": "totalAmountTokenized",
            "type": "u64"
          },
          {
            "name": "currentAmountTokenized",
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
            "name": "padding",
            "type": {
              "array": [
                "u64",
                31
              ]
            }
          },
          {
            "name": "totalAmountLiquidated",
            "type": "u64"
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
  ],
  "errors": []
}
  