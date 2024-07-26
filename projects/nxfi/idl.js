module.exports = {
  "version": "0.1.0",
  "name": "nxlend",
  "instructions": [],
  "accounts": [
    {
      "name": "Reserve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "tokenDecimals",
            "type": "u8"
          },
          {
            "name": "aliPadding1",
            "type": {
              "array": [
                "i8",
                7
              ]
            }
          },
          {
            "name": "creditDebit",
            "type": {
              "defined": "ReserveCreditDebit"
            }
          },
          {
            "name": "tokenInfo",
            "type": {
              "defined": "ReserveToken"
            }
          },
          {
            "name": "treasury",
            "type": {
              "defined": "ReserveTreasury"
            }
          },
          {
            "name": "marketFee",
            "type": {
              "defined": "MarketFee"
            }
          },
          {
            "name": "setting",
            "type": {
              "defined": "ReserveSetting"
            }
          },
          {
            "name": "emissionsFlags",
            "docs": [
              "Emissions Config Flags",
              "",
              "- EMISSIONS_FLAG_BORROW_ACTIVE: 1",
              "- EMISSIONS_FLAG_LENDING_ACTIVE: 2",
              ""
            ],
            "type": "u64"
          },
          {
            "name": "emissionsRate",
            "docs": [
              "Emissions APR.",
              "Number of emitted tokens (emissions_mint) per 1e(reserve.mint_decimal) tokens (reserve mint) (native amount) per 1 YEAR."
            ],
            "type": "u64"
          },
          {
            "name": "emissionsRemaining",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "emissionsMint",
            "type": "publicKey"
          },
          {
            "name": "padding0",
            "type": {
              "array": [
                "u128",
                28
              ]
            }
          },
          {
            "name": "padding1",
            "type": {
              "array": [
                "u128",
                32
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InterestModel",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rateChangeUr1",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "irUr1",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "rateChangeUr2",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "irUr2",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "maxIr",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "treasuryBaseApr",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "treasuryAdditionRatio",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "marketFeeBase",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "marketAdditionRatio",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u128",
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "ReserveToken",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenAccount",
            "type": "publicKey"
          },
          {
            "name": "tokenAccountBump",
            "type": "u8"
          },
          {
            "name": "tokenAccountAuthorityBump",
            "type": "u8"
          },
          {
            "name": "aliPadding1",
            "type": {
              "array": [
                "i8",
                6
              ]
            }
          }
        ]
      }
    },
    {
      "name": "ReserveTreasury",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "treasuryTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "treasuryTokenAccountBump",
            "type": "u8"
          },
          {
            "name": "treasuryAuthorityBump",
            "type": "u8"
          },
          {
            "name": "aliPadding1",
            "type": {
              "array": [
                "i8",
                6
              ]
            }
          },
          {
            "name": "unpayedTreasuryFee",
            "type": {
              "defined": "WrappedI80F48"
            }
          }
        ]
      }
    },
    {
      "name": "MarketFee",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketFeeTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "marketFeeAccountBump",
            "type": "u8"
          },
          {
            "name": "marketFeeAuthorityBump",
            "type": "u8"
          },
          {
            "name": "aliPadding1",
            "type": {
              "array": [
                "i8",
                6
              ]
            }
          },
          {
            "name": "unpayedMarketFee",
            "type": {
              "defined": "WrappedI80F48"
            }
          }
        ]
      }
    },
    {
      "name": "ReserveCreditDebit",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "assetNtokenRatio",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "debtNtokenRatio",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "reserveDebtNtokenAmount",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "reserveAssetNtokenAmount",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "updateTimeOfInterest",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ReserveSetting",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "assetValueRatio",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "assetValueLiqRatio",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "debtValueRatioHighRisk",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "debtValueRatioMidRisk",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "debtValueRatioLowRisk",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "debtValueLiqRatio",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "capacity",
            "type": "u64"
          },
          {
            "name": "interestSetting",
            "type": {
              "defined": "InterestModel"
            }
          },
          {
            "name": "reserveType",
            "type": {
              "defined": "ReserveType"
            }
          },
          {
            "name": "operationalState",
            "type": {
              "defined": "ReserveOperationalState"
            }
          },
          {
            "name": "aliPadding1",
            "type": {
              "array": [
                "i8",
                5
              ]
            }
          },
          {
            "name": "oracleType",
            "type": {
              "defined": "OracleType"
            }
          },
          {
            "name": "oracleKeys",
            "type": {
              "array": [
                "publicKey",
                5
              ]
            }
          },
          {
            "name": "maxBorrowable",
            "type": "u64"
          },
          {
            "name": "maxExposure",
            "docs": [
              "USD denominated limit for calculating asset value for initialization nxlend requirements.",
              "Example, if total SOL deposits are equal to $1M and the limit it set to $500K,",
              "then SOL assets will be discounted by 50%.",
              "",
              "In other words the max value of liabilities that can be backed by the asset is $500K.",
              "This is useful for limiting the damage of orcale attacks.",
              "",
              "Value is UI USD value, for example value 100 -> $100"
            ],
            "type": "u64"
          },
          {
            "name": "maxPriceAge",
            "type": "u64"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u64",
                6
              ]
            }
          }
        ]
      }
    },
    {
      "name": "WrappedI80F48",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "value",
            "type": "i128"
          }
        ]
      }
    },
    {
      "name": "ReserveOperationalState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Paused"
          },
          {
            "name": "Operational"
          },
          {
            "name": "ReduceOnly"
          }
        ]
      }
    },
    {
      "name": "ReserveType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Collateral"
          },
          {
            "name": "NoCollaAddup"
          }
        ]
      }
    },
    {
      "name": "ReserveVaultType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Liquidity"
          },
          {
            "name": "Insurance"
          },
          {
            "name": "Fee"
          }
        ]
      }
    },
    {
      "name": "OracleType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "None"
          },
          {
            "name": "PythEma"
          },
          {
            "name": "SwitchboardV2"
          },
          {
            "name": "PythV2"
          }
        ]
      }
    }
  ],
  "events": [],
  "errors": [],
  "metadata": {
    "address": "7YYkqwXp812NMe6nWny2JAGsm6b3CVvbQKiMo8SuaPMg"
  }
}
