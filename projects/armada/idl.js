const ArmadaIDL = {
  "version": "0.1.1",
  "name": "clp_vault",
  "instructions": [],
  "accounts": [
    {
      "name": "clpVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bumpSeed",
            "type": "u8"
          },
          {
            "name": "padding0",
            "type": {
              "array": [
                "u8",
                15
              ]
            }
          },
          {
            "name": "nonce",
            "type": "u16"
          },
          {
            "name": "padding1",
            "type": {
              "array": [
                "u8",
                14
              ]
            }
          },
          {
            "name": "clp",
            "type": "publicKey"
          },
          {
            "name": "lpMint",
            "type": "publicKey"
          },
          {
            "name": "lpMintBump",
            "type": "u8"
          },
          {
            "name": "padding2",
            "type": {
              "array": [
                "u8",
                15
              ]
            }
          },
          {
            "name": "tokenMintA",
            "type": "publicKey"
          },
          {
            "name": "tokenVaultA",
            "type": "publicKey"
          },
          {
            "name": "tokenMintB",
            "type": "publicKey"
          },
          {
            "name": "tokenVaultB",
            "type": "publicKey"
          },
          {
            "name": "performanceFee",
            "type": "u32"
          },
          {
            "name": "padding3",
            "type": {
              "array": [
                "u8",
                12
              ]
            }
          },
          {
            "name": "withdrawalFee",
            "type": "u32"
          },
          {
            "name": "padding4",
            "type": {
              "array": [
                "u8",
                12
              ]
            }
          },
          {
            "name": "marketMakingFee",
            "type": "u32"
          },
          {
            "name": "padding5",
            "type": {
              "array": [
                "u8",
                12
              ]
            }
          },
          {
            "name": "strategy",
            "type": {
              "defined": "StrategyType"
            }
          },
          {
            "name": "padding6",
            "type": {
              "array": [
                "u8",
                15
              ]
            }
          },
          {
            "name": "marketMakingKey",
            "type": "publicKey"
          },
          {
            "name": "adminKey",
            "type": "publicKey"
          },
          {
            "name": "feeOwner",
            "type": "publicKey"
          },
          {
            "name": "numActivePositions",
            "type": "u8"
          },
          {
            "name": "padding7",
            "type": {
              "array": [
                "u8",
                15
              ]
            }
          },
          {
            "name": "positionBundleTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "positionBundleMint",
            "type": "publicKey"
          },
          {
            "name": "positionBundle",
            "type": "publicKey"
          },
          {
            "name": "positions",
            "type": {
              "array": [
                {
                  "defined": "VaultPosition"
                },
                5
              ]
            }
          },
          {
            "name": "initialTokenRatio",
            "type": {
              "defined": "TokenRatio"
            }
          },
          {
            "name": "stakePool",
            "type": "publicKey"
          },
          {
            "name": "ratioCache",
            "type": {
              "defined": "VaultRatioCache"
            }
          },
          {
            "name": "reserved0",
            "type": {
              "array": [
                "u8",
                448
              ]
            }
          },
          {
            "name": "reserved1",
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
      "name": "VaultRatioCache",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalTokenA",
            "type": "u64"
          },
          {
            "name": "totalTokenB",
            "type": "u64"
          },
          {
            "name": "lpSupply",
            "type": "u64"
          },
          {
            "name": "cachedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "TokenRatio",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenA",
            "type": "u64"
          },
          {
            "name": "tokenB",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "VaultPosition",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "positionKey",
            "type": "publicKey"
          },
          {
            "name": "lowerTick",
            "type": "i32"
          },
          {
            "name": "padding0",
            "type": {
              "array": [
                "u8",
                12
              ]
            }
          },
          {
            "name": "upperTick",
            "type": "i32"
          },
          {
            "name": "padding1",
            "type": {
              "array": [
                "u8",
                12
              ]
            }
          },
          {
            "name": "reserve",
            "type": {
              "array": [
                "u128",
                16
              ]
            }
          }
        ]
      }
    },
    {
      "name": "ClpProvider",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "ORCA"
          }
        ]
      }
    },
    {
      "name": "StrategyType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "PriceDiscovery"
          },
          {
            "name": "VolatilePair"
          },
          {
            "name": "StablePair"
          },
          {
            "name": "StableSlowlyDiverging"
          }
        ]
      }
    }
  ],
  "events": [],
  "errors": []
};

const WhirpoolIDL = {
  "version": "0.2.0",
  "name": "whirlpool",
  "instructions": [],
  "accounts": [
    {
      "name": "position",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "whirlpool",
            "type": "publicKey"
          },
          {
            "name": "positionMint",
            "type": "publicKey"
          },
          {
            "name": "liquidity",
            "type": "u128"
          },
          {
            "name": "tickLowerIndex",
            "type": "i32"
          },
          {
            "name": "tickUpperIndex",
            "type": "i32"
          },
          {
            "name": "feeGrowthCheckpointA",
            "type": "u128"
          },
          {
            "name": "feeOwedA",
            "type": "u64"
          },
          {
            "name": "feeGrowthCheckpointB",
            "type": "u128"
          },
          {
            "name": "feeOwedB",
            "type": "u64"
          },
          {
            "name": "rewardInfos",
            "type": {
              "array": [
                {
                  "defined": "PositionRewardInfo"
                },
                3
              ]
            }
          }
        ]
      }
    },
    {
      "name": "whirlpool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "whirlpoolsConfig",
            "type": "publicKey"
          },
          {
            "name": "whirlpoolBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "tickSpacing",
            "type": "u16"
          },
          {
            "name": "tickSpacingSeed",
            "type": {
              "array": [
                "u8",
                2
              ]
            }
          },
          {
            "name": "feeRate",
            "type": "u16"
          },
          {
            "name": "protocolFeeRate",
            "type": "u16"
          },
          {
            "name": "liquidity",
            "type": "u128"
          },
          {
            "name": "sqrtPrice",
            "type": "u128"
          },
          {
            "name": "tickCurrentIndex",
            "type": "i32"
          },
          {
            "name": "protocolFeeOwedA",
            "type": "u64"
          },
          {
            "name": "protocolFeeOwedB",
            "type": "u64"
          },
          {
            "name": "tokenMintA",
            "type": "publicKey"
          },
          {
            "name": "tokenVaultA",
            "type": "publicKey"
          },
          {
            "name": "feeGrowthGlobalA",
            "type": "u128"
          },
          {
            "name": "tokenMintB",
            "type": "publicKey"
          },
          {
            "name": "tokenVaultB",
            "type": "publicKey"
          },
          {
            "name": "feeGrowthGlobalB",
            "type": "u128"
          },
          {
            "name": "rewardLastUpdatedTimestamp",
            "type": "u64"
          },
          {
            "name": "rewardInfos",
            "type": {
              "array": [
                {
                  "defined": "WhirlpoolRewardInfo"
                },
                3
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PositionRewardInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "growthInsideCheckpoint",
            "type": "u128"
          },
          {
            "name": "amountOwed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "WhirlpoolRewardInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "vault",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "emissionsPerSecondX64",
            "type": "u128"
          },
          {
            "name": "growthGlobalX64",
            "type": "u128"
          }
        ]
      }
    },
  ],
  "errors": []
};

module.exports = {
  ArmadaIDL,
  WhirpoolIDL
}