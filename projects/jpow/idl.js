const JpowLending = {
  "address": "3APJcbC2iHEFGv4y6a8Fi5nQ5u75ML85TQreSr7cpRDs",
  "instructions": [],
  "accounts": [
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "controller",
      "discriminator": [
        184,
        79,
        171,
        0,
        183,
        43,
        113,
        110
      ]
    },
    {
      "name": "crosschainConfig",
      "discriminator": [
        29,
        3,
        68,
        189,
        250,
        99,
        9,
        205
      ]
    },
    {
      "name": "crosschainType1Depository",
      "discriminator": [
        183,
        8,
        117,
        91,
        202,
        45,
        216,
        77
      ]
    },
    {
      "name": "farmingConfig",
      "discriminator": [
        227,
        37,
        190,
        173,
        145,
        73,
        54,
        104
      ]
    },
    {
      "name": "investment",
      "discriminator": [
        175,
        134,
        9,
        175,
        115,
        153,
        39,
        28
      ]
    },
    {
      "name": "loanType0",
      "discriminator": [
        53,
        107,
        87,
        167,
        145,
        117,
        129,
        201
      ]
    },
    {
      "name": "loanType1",
      "discriminator": [
        53,
        13,
        71,
        44,
        243,
        56,
        227,
        110
      ]
    },
    {
      "name": "redeemByCollateralConfigV2",
      "discriminator": [
        84,
        193,
        134,
        218,
        211,
        27,
        137,
        25
      ]
    },
    {
      "name": "swapUsdaiConfig",
      "discriminator": [
        34,
        190,
        22,
        120,
        246,
        58,
        3,
        167
      ]
    },
    {
      "name": "type0Depository",
      "discriminator": [
        202,
        54,
        70,
        164,
        112,
        15,
        110,
        15
      ]
    },
    {
      "name": "type1Depository",
      "discriminator": [
        132,
        68,
        105,
        249,
        215,
        58,
        64,
        100
      ]
    },
    {
      "name": "universalWallet",
      "discriminator": [
        209,
        219,
        212,
        246,
        186,
        188,
        20,
        71
      ]
    },
    {
      "name": "userInfo",
      "discriminator": [
        83,
        134,
        200,
        56,
        144,
        56,
        10,
        62
      ]
    },
    {
      "name": "vaultInfo",
      "discriminator": [
        133,
        250,
        161,
        78,
        246,
        27,
        55,
        187
      ]
    },
    {
      "name": "walletLinked",
      "discriminator": [
        249,
        171,
        22,
        59,
        3,
        203,
        66,
        87
      ]
    },
    {
      "name": "whitelistAdmin",
      "discriminator": [
        163,
        150,
        229,
        143,
        243,
        38,
        17,
        133
      ]
    }
  ],
  "events": [],
  "errors": [],
  "types": [
    {
      "name": "burnCrosschainEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "universalWallet",
            "type": "pubkey"
          },
          {
            "name": "walletAddress",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "chainId",
            "type": "u64"
          },
          {
            "name": "burnedAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "burnType1Event",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "burnAmount",
            "type": "u64"
          },
          {
            "name": "newDebt",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "chainWallet",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "walletAddress",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "chainId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "changeNewCollateralType1",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "controller",
            "type": "pubkey"
          },
          {
            "name": "collateralNew",
            "type": "pubkey"
          },
          {
            "name": "collateralOld",
            "type": "pubkey"
          },
          {
            "name": "collateralizationRatioType1",
            "type": "u64"
          },
          {
            "name": "liquidationRatioType1",
            "type": "u64"
          },
          {
            "name": "isPausedType1",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "collateralType1",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "collateralMint",
            "type": "pubkey"
          },
          {
            "name": "collateralTotal",
            "type": "u64"
          },
          {
            "name": "collateralizationRatio",
            "type": "u64"
          },
          {
            "name": "liquidationRatio",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "decimals",
            "type": "u8"
          },
          {
            "name": "isPaused",
            "type": "u8"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                13
              ]
            }
          }
        ]
      }
    },
    {
      "name": "config",
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "vaultBotServer",
            "type": "pubkey"
          },
          {
            "name": "feeWallet",
            "type": "pubkey"
          },
          {
            "name": "allowedLendingPools",
            "type": {
              "array": [
                "pubkey",
                10
              ]
            }
          },
          {
            "name": "performanceFeePercent",
            "type": "u64"
          },
          {
            "name": "monthlyManagementFee",
            "type": "u64"
          },
          {
            "name": "nextMonthlyFeeCollectionTime",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "controller",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "redeemableMintBump",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "pendingAuthority",
            "type": "pubkey"
          },
          {
            "name": "redeemableMint",
            "type": "pubkey"
          },
          {
            "name": "debtSupply",
            "type": "u64"
          },
          {
            "name": "debtSupplycap",
            "type": "u64"
          },
          {
            "name": "base",
            "type": "u64"
          },
          {
            "name": "reserve",
            "type": "pubkey"
          },
          {
            "name": "redeemableOracle",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "convertStablecoinToUsdaiEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "stablecoinMint",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "convertUsdaiToStablecoinEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "stablecoinMint",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "crosschainCollateralToken",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "deposited",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "crosschainConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "guardians",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "crosschainType1Depository",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "collateralTokens",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "crosschainCollateralToken"
                  }
                },
                32
              ]
            }
          },
          {
            "name": "depository",
            "type": "pubkey"
          },
          {
            "name": "debtSupply",
            "type": "u64"
          },
          {
            "name": "chainId",
            "type": "u64"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "depositCrosschainEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "universalWallet",
            "type": "pubkey"
          },
          {
            "name": "walletAddress",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "chainId",
            "type": "u64"
          },
          {
            "name": "collateral",
            "type": "pubkey"
          },
          {
            "name": "collateralAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "depositType1Event",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "collateral",
            "type": "pubkey"
          },
          {
            "name": "collateralAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "editControllerFields",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "debtSupplycap",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "base",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "oracle",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "reserve",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "editCrosschainCollateralTokenField",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldCollateralToken",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "newCollateralToken",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "editFarmingConfigFields",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenFarmingOld",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "tokenFarmingNew",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "walletFarmingOld",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "walletFarmingNew",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "editSwapUsdaiConfigField",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldTokenAddress",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "newTokenAddress",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "swapLimit",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "fee0",
            "type": {
              "option": "u16"
            }
          },
          {
            "name": "fee1",
            "type": {
              "option": "u16"
            }
          }
        ]
      }
    },
    {
      "name": "editType0DepositoryFields",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "debtCeiling",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "collateralizationRatio",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "liquidationRatio",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "liquidationPenalty",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "dust",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "duty",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "rate",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "oracle",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "pause",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "limit",
            "type": {
              "option": {
                "option": "u64"
              }
            }
          }
        ]
      }
    },
    {
      "name": "editType1CollateralFields",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "collateralizationRatioType1",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "liquidationRatioType1",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "isPauseCollateralType1",
            "type": {
              "option": "u8"
            }
          }
        ]
      }
    },
    {
      "name": "editType1DepositoryFields",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oracle",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "debtCeiling",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "liquidationPenalty",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "dust",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "duty",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "rate",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "pause",
            "type": {
              "option": "u8"
            }
          }
        ]
      }
    },
    {
      "name": "farmingConfig",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "farmingTokens",
            "type": {
              "array": [
                "pubkey",
                5
              ]
            }
          },
          {
            "name": "farmingWallets",
            "type": {
              "array": [
                "pubkey",
                5
              ]
            }
          },
          {
            "name": "farmingAmountType0",
            "type": {
              "array": [
                "u64",
                5
              ]
            }
          },
          {
            "name": "farmingAmountType1",
            "type": {
              "array": [
                "u64",
                5
              ]
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                160
              ]
            }
          }
        ]
      }
    },
    {
      "name": "initType1CollateralEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "controller",
            "type": "pubkey"
          },
          {
            "name": "collateral",
            "type": "pubkey"
          },
          {
            "name": "collateralizationRatioType1",
            "type": "u64"
          },
          {
            "name": "liquidationRatioType1",
            "type": "u64"
          },
          {
            "name": "isPausedType1",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "initializeControllerEvent",
      "docs": [
        "Event called in [instructions::initialize_controller::handler]."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "docs": [
              "The controller version."
            ],
            "type": "u8"
          },
          {
            "name": "controller",
            "docs": [
              "The controller being created."
            ],
            "type": "pubkey"
          },
          {
            "name": "authority",
            "docs": [
              "The authority."
            ],
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "interactWithTypeODepositoryEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "collateral",
            "type": "pubkey"
          },
          {
            "name": "collateralAmount",
            "type": "u64"
          },
          {
            "name": "debtAmount",
            "type": "u64"
          },
          {
            "name": "collateralFlag",
            "type": "bool"
          },
          {
            "name": "loanFlag",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "investment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amountType0",
            "type": "u64"
          },
          {
            "name": "amountType1",
            "type": "u64"
          },
          {
            "name": "proportion",
            "type": "u64"
          },
          {
            "name": "revenue",
            "type": "u64"
          },
          {
            "name": "whitelistWallet",
            "type": "pubkey"
          },
          {
            "name": "revenueWallet",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "liquidationEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "liquidator",
            "type": "pubkey"
          },
          {
            "name": "repayAmount",
            "type": "u64"
          },
          {
            "name": "collateralClaimed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "loanType0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "collateralAmount",
            "type": "u64"
          },
          {
            "name": "mintedAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "loanType1",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "collateralToken",
            "type": {
              "array": [
                "pubkey",
                8
              ]
            }
          },
          {
            "name": "collateralAmount",
            "type": {
              "array": [
                "u64",
                8
              ]
            }
          },
          {
            "name": "mintedAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "metadataFields",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "sellerFeeBasisPoints",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "mintCrosschainEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "universalWallet",
            "type": "pubkey"
          },
          {
            "name": "walletAddress",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "chainId",
            "type": "u64"
          },
          {
            "name": "mintedAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "mintType1Event",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "mintAmount",
            "type": "u64"
          },
          {
            "name": "newDebt",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "priceGroup",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "Bump seed used to generate the program address / authority"
            ],
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "priceGroupData",
            "type": {
              "vec": {
                "defined": {
                  "name": "priceGroupData"
                }
              }
            }
          },
          {
            "name": "updatedTimestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "priceGroupData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "price",
            "type": "f64"
          }
        ]
      }
    },
    {
      "name": "pricePair",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "Bump seed used to generate the program address / authority"
            ],
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "metadata",
            "docs": [
              "Owner of the configuration"
            ],
            "type": "pubkey"
          },
          {
            "name": "price",
            "type": "f64"
          },
          {
            "name": "updatedTimestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "redeemByCollateralConfigV2",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "collateral",
            "type": {
              "array": [
                "pubkey",
                32
              ]
            }
          },
          {
            "name": "isPausedCollateral",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "isPausedFunction",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "setType0DepositoryCollateralizationRatioEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "controller",
            "type": "pubkey"
          },
          {
            "name": "depository",
            "type": "pubkey"
          },
          {
            "name": "collateralizationRatio",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "setType0DepositoryDebtCeilingEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "controller",
            "type": "pubkey"
          },
          {
            "name": "depository",
            "type": "pubkey"
          },
          {
            "name": "debtCeiling",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "setType0DepositoryDustEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "controller",
            "type": "pubkey"
          },
          {
            "name": "depository",
            "type": "pubkey"
          },
          {
            "name": "dust",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "setType0DepositoryLiquidationPenaltyEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "controller",
            "type": "pubkey"
          },
          {
            "name": "depository",
            "type": "pubkey"
          },
          {
            "name": "liquidationPenalty",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "setType0DepositoryLiquidationRatioEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "controller",
            "type": "pubkey"
          },
          {
            "name": "depository",
            "type": "pubkey"
          },
          {
            "name": "liquidationRatio",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "setType1CollateralizationRatioEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "controller",
            "type": "pubkey"
          },
          {
            "name": "collateral",
            "type": "pubkey"
          },
          {
            "name": "collateralizationRatio",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "setType1DepositoryDebtCeilingEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "controller",
            "type": "pubkey"
          },
          {
            "name": "depository",
            "type": "pubkey"
          },
          {
            "name": "debtCeiling",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "setType1DepositoryDustEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "controller",
            "type": "pubkey"
          },
          {
            "name": "depository",
            "type": "pubkey"
          },
          {
            "name": "dust",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "setType1DepositoryLiquidationPenaltyEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "controller",
            "type": "pubkey"
          },
          {
            "name": "depository",
            "type": "pubkey"
          },
          {
            "name": "liquidationPenalty",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "setType1LiquidationRatioEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "controller",
            "type": "pubkey"
          },
          {
            "name": "colateral",
            "type": "pubkey"
          },
          {
            "name": "liquidationRatio",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "swapUsdaiConfig",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stablecoins",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "swapUsdaiStablecoinInfo"
                  }
                },
                7
              ]
            }
          },
          {
            "name": "isPaused",
            "type": "u8"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          }
        ]
      }
    },
    {
      "name": "swapUsdaiStablecoinInfo",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "swapLimit",
            "type": "u64"
          },
          {
            "name": "swappedAmount",
            "type": "i64"
          },
          {
            "name": "fee0",
            "type": "u16"
          },
          {
            "name": "fee1",
            "type": "u16"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                4
              ]
            }
          }
        ]
      }
    },
    {
      "name": "type0Depository",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "collateral",
            "type": "pubkey"
          },
          {
            "name": "oracle",
            "type": "pubkey"
          },
          {
            "name": "debtCeiling",
            "type": "u64"
          },
          {
            "name": "collateralizationRatio",
            "type": "u64"
          },
          {
            "name": "liquidationRatio",
            "type": "u64"
          },
          {
            "name": "liquidationPenalty",
            "type": "u64"
          },
          {
            "name": "debtTotal",
            "type": "u64"
          },
          {
            "name": "collateralTotal",
            "type": "u64"
          },
          {
            "name": "dust",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "duty",
            "type": "u64"
          },
          {
            "name": "rho",
            "type": "u64"
          },
          {
            "name": "rate",
            "type": "u64"
          },
          {
            "name": "isPaused",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "type1Depository",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "collateralType1",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "collateralType1"
                  }
                },
                32
              ]
            }
          },
          {
            "name": "collateralTokens",
            "type": {
              "array": [
                "pubkey",
                32
              ]
            }
          },
          {
            "name": "oracle",
            "type": "pubkey"
          },
          {
            "name": "debtCeilingType1",
            "type": "u64"
          },
          {
            "name": "debtTotal",
            "type": "u64"
          },
          {
            "name": "liquidationPenalty",
            "type": "u64"
          },
          {
            "name": "dust",
            "type": "u64"
          },
          {
            "name": "duty",
            "type": "u64"
          },
          {
            "name": "rho",
            "type": "u64"
          },
          {
            "name": "rate",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "isPaused",
            "type": "u8"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                6
              ]
            }
          }
        ]
      }
    },
    {
      "name": "universalWallet",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallets",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "chainWallet"
                  }
                },
                32
              ]
            }
          },
          {
            "name": "firstWallet",
            "type": {
              "defined": {
                "name": "chainWallet"
              }
            }
          },
          {
            "name": "linkingRequest",
            "type": {
              "defined": {
                "name": "chainWallet"
              }
            }
          }
        ]
      }
    },
    {
      "name": "userInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "depositedLendingUsdc",
            "type": "f64"
          },
          {
            "name": "depositedUsdc",
            "type": "u64"
          },
          {
            "name": "reserveUsdc",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "vaultInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "lendingPool",
            "type": "pubkey"
          },
          {
            "name": "totalLendingUsdc",
            "type": "f64"
          },
          {
            "name": "reserveUsdc",
            "type": "u64"
          },
          {
            "name": "isLocked",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "walletLinked",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "whitelistAdmin",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "whitelistAdmins",
            "type": {
              "array": [
                "pubkey",
                5
              ]
            }
          }
        ]
      }
    },
    {
      "name": "withdrawCrosschainEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "universalWallet",
            "type": "pubkey"
          },
          {
            "name": "walletAddress",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "chainId",
            "type": "u64"
          },
          {
            "name": "collateral",
            "type": "pubkey"
          },
          {
            "name": "collateralAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "withdrawType1Event",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "collateral",
            "type": "pubkey"
          },
          {
            "name": "collateralAmount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};

module.exports = {
  JpowLending
}