module.exports = {
  "version": "0.1.0",
  "name": "nxlend",
  "instructions": [
    {
      "name": "createMarket",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setupMarketManager",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newManager",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "addReserve",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "feePayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "reserveMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "type": "publicKey",
                "path": "nxlend_market"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Mint",
                "path": "reserve_mint"
              },
              {
                "kind": "arg",
                "type": "u64",
                "path": "reserve_seed"
              }
            ]
          }
        },
        {
          "name": "tokenAccountAuthority",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "reserve_token_acc_auth_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "reserveTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "reserve_token_acc_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "treasuryAuthority",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "treasury_token_acc_auth_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "treasuryTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "treasury_token_acc_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "marketFeeAuth",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "market_fee_auth_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "marketFeeAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "maket_fee_token_acc_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "initSetting",
          "type": {
            "defined": "InitReserveSetting"
          }
        },
        {
          "name": "reserveSeed",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateReserve",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "settingUpdate",
          "type": {
            "defined": "ReserveSettingUpdate"
          }
        }
      ]
    },
    {
      "name": "setupReward",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "emissionsMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "emissionsAuth",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "emissions_auth_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Mint",
                "path": "emissions_mint"
              }
            ]
          }
        },
        {
          "name": "emissionsTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "emissions_token_account_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Mint",
                "path": "emissions_mint"
              }
            ]
          }
        },
        {
          "name": "emissionsFundingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "flags",
          "type": "u64"
        },
        {
          "name": "rate",
          "type": "u64"
        },
        {
          "name": "totalEmissions",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateReward",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "emissionsMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "emissionsTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "emissions_token_account_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Mint",
                "path": "emissions_mint"
              }
            ]
          }
        },
        {
          "name": "emissionsFundingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "emissionsFlags",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "emissionsRate",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "additionalEmissions",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "handleBadDebt",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nxlendAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "reserve_token_acc_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "treasuryTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "treasury_token_acc_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "treasuryAuthority",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "treasury_token_acc_auth_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createUserAccount",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nxlendAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "type": "publicKey",
                "path": "nxlend_market"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "owner"
              },
              {
                "kind": "arg",
                "type": "u64",
                "path": "account_seed"
              }
            ]
          }
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "feePayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "accountSeed",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setAccountRepayLtv",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nxlendAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "setup by owner"
          ]
        }
      ],
      "args": [
        {
          "name": "repayLtv",
          "type": {
            "defined": "WrappedI80F48"
          }
        }
      ]
    },
    {
      "name": "setAccountRiskPreference",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nxlendAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "setup by owner"
          ]
        }
      ],
      "args": [
        {
          "name": "riskPreference",
          "type": {
            "defined": "UserRiskPreference"
          }
        }
      ]
    },
    {
      "name": "depositIntoReserve",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nxlendAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveAssetTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "reserve_token_acc_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "repayToReserve",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nxlendAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "reserve_token_acc_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "repayAll",
          "type": {
            "option": "bool"
          }
        }
      ]
    },
    {
      "name": "withdrawFromReserve",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nxlendAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destinationTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccountAuthority",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "reserve_token_acc_auth_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "reserveTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "reserve_token_acc_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "withdrawAll",
          "type": {
            "option": "bool"
          }
        }
      ]
    },
    {
      "name": "borrowFromReserve",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nxlendAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destinationTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccountAuthority",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "reserve_token_acc_auth_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "reserveTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "reserve_token_acc_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "userCloseReservePosition",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nxlendAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "userWithdrawReward",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nxlendAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "emissionsMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "emissionsAuth",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "emissions_auth_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Mint",
                "path": "emissions_mint"
              }
            ]
          }
        },
        {
          "name": "emissionsVault",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "emissions_token_account_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Mint",
                "path": "emissions_mint"
              }
            ]
          }
        },
        {
          "name": "destinationAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "userSettleReward",
      "accounts": [
        {
          "name": "nxlendAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "liquidateUser",
      "docs": [
        "Liquidate a lending account balance of an unhealthy nxlend account"
      ],
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "assetReserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "debtReserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liquidatorNxlendAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "liquidateeNxlendAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveTokenAccountAuth",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "reserve_token_acc_auth_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "debt_reserve"
              }
            ]
          }
        },
        {
          "name": "reserveTokenAcc",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "reserve_token_acc_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "debt_reserve"
              }
            ]
          }
        },
        {
          "name": "treasuryTokenAcc",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "treasury_token_acc_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "debt_reserve"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "assetAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "settleInterest",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "reserveSettleFee",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccountAuthority",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "reserve_token_acc_auth_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "reserveTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "reserve_token_acc_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "treasuryTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "treasury_token_acc_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "marketFeeAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "maket_fee_token_acc_seed"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "reserve"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setAccountFlag",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nxlendAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "manager only"
          ]
        }
      ],
      "args": [
        {
          "name": "flag",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unsetAccountFlag",
      "accounts": [
        {
          "name": "nxlendMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nxlendAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "Manager only"
          ]
        }
      ],
      "args": [
        {
          "name": "flag",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "NxlendAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "market",
            "type": "publicKey"
          },
          {
            "name": "userMarketInfo",
            "type": {
              "defined": "UserMarketInfo"
            }
          },
          {
            "name": "repayLtv",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "riskPreference",
            "type": {
              "defined": "UserRiskPreference"
            }
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
            "name": "accountFlags",
            "docs": [
              "The flags that indicate the state of the account.",
              "This is u64 bitfield, where each bit represents a flag.",
              "",
              "Flags:",
              "- DISABLED_FLAG = 1 << 0 = 1 - This flag indicates that the account is disabled,",
              "and no further actions can be taken on it."
            ],
            "type": "u64"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u64",
                61
              ]
            }
          }
        ]
      }
    },
    {
      "name": "NxlendMarket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "manager",
            "type": "publicKey"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u128",
                32
              ]
            }
          }
        ]
      }
    },
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
      "name": "MarketEventHeader",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "signer",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "nxlendMarket",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "AccountEventHeader",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "signer",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "nxlendAccount",
            "type": "publicKey"
          },
          {
            "name": "nxlendAccountAuthority",
            "type": "publicKey"
          },
          {
            "name": "nxlendMarket",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "LiquidationBalances",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "liquidateeAssetBalance",
            "type": "f64"
          },
          {
            "name": "liquidateeLiabilityBalance",
            "type": "f64"
          },
          {
            "name": "liquidatorAssetBalance",
            "type": "f64"
          },
          {
            "name": "liquidatorLiabilityBalance",
            "type": "f64"
          }
        ]
      }
    },
    {
      "name": "UserMarketInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userReserves",
            "type": {
              "array": [
                {
                  "defined": "UserReserveInfo"
                },
                15
              ]
            }
          }
        ]
      }
    },
    {
      "name": "UserReserveInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "active",
            "type": "bool"
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
            "name": "reservePk",
            "type": "publicKey"
          },
          {
            "name": "assetNtokenAmount",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "debtNtokenAmount",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "emissionsOutstanding",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "lastUpdate",
            "type": "u64"
          },
          {
            "name": "padding",
            "docs": [
              "acccumulated time * share"
            ],
            "type": {
              "array": [
                "u64",
                10
              ]
            }
          }
        ]
      }
    },
    {
      "name": "InterestModelInput",
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
          }
        ]
      }
    },
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
      "name": "InterestModelUpdate",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rateChangeUr1",
            "type": {
              "option": {
                "defined": "WrappedI80F48"
              }
            }
          },
          {
            "name": "irUr1",
            "type": {
              "option": {
                "defined": "WrappedI80F48"
              }
            }
          },
          {
            "name": "rateChangeUr2",
            "type": {
              "option": {
                "defined": "WrappedI80F48"
              }
            }
          },
          {
            "name": "irUr2",
            "type": {
              "option": {
                "defined": "WrappedI80F48"
              }
            }
          },
          {
            "name": "maxIr",
            "type": {
              "option": {
                "defined": "WrappedI80F48"
              }
            }
          },
          {
            "name": "treasuryBaseApr",
            "type": {
              "option": {
                "defined": "WrappedI80F48"
              }
            }
          },
          {
            "name": "treasuryAdditionRatio",
            "type": {
              "option": {
                "defined": "WrappedI80F48"
              }
            }
          },
          {
            "name": "marketFeeBase",
            "type": {
              "option": {
                "defined": "WrappedI80F48"
              }
            }
          },
          {
            "name": "marketAdditionRatio",
            "type": {
              "option": {
                "defined": "WrappedI80F48"
              }
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
      "name": "InitReserveSetting",
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
              "defined": "InterestModelInput"
            }
          },
          {
            "name": "operationalState",
            "type": {
              "defined": "ReserveOperationalState"
            }
          },
          {
            "name": "oracleType",
            "type": {
              "defined": "OracleType"
            }
          },
          {
            "name": "oracleKey",
            "type": "publicKey"
          },
          {
            "name": "maxBorrowable",
            "type": "u64"
          },
          {
            "name": "reserveType",
            "type": {
              "defined": "ReserveType"
            }
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
      "name": "ReserveSettingUpdate",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "assetValueRatio",
            "type": {
              "option": {
                "defined": "WrappedI80F48"
              }
            }
          },
          {
            "name": "assetValueLiqRatio",
            "type": {
              "option": {
                "defined": "WrappedI80F48"
              }
            }
          },
          {
            "name": "debtValueRatioHighRisk",
            "type": {
              "option": {
                "defined": "WrappedI80F48"
              }
            }
          },
          {
            "name": "debtValueRatioMidRisk",
            "type": {
              "option": {
                "defined": "WrappedI80F48"
              }
            }
          },
          {
            "name": "debtValueRatioLowRisk",
            "type": {
              "option": {
                "defined": "WrappedI80F48"
              }
            }
          },
          {
            "name": "debtValueLiqRatio",
            "type": {
              "option": {
                "defined": "WrappedI80F48"
              }
            }
          },
          {
            "name": "capacity",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "maxBorrowable",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "operationalState",
            "type": {
              "option": {
                "defined": "ReserveOperationalState"
              }
            }
          },
          {
            "name": "oracle",
            "type": {
              "option": {
                "defined": "OracleConfig"
              }
            }
          },
          {
            "name": "interestSetting",
            "type": {
              "option": {
                "defined": "InterestModelUpdate"
              }
            }
          },
          {
            "name": "reserveType",
            "type": {
              "option": {
                "defined": "ReserveType"
              }
            }
          },
          {
            "name": "maxExposure",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "maxPriceAge",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "OracleConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "setup",
            "type": {
              "defined": "OracleType"
            }
          },
          {
            "name": "keys",
            "type": {
              "array": [
                "publicKey",
                5
              ]
            }
          }
        ]
      }
    },
    {
      "name": "UserRiskPreference",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Low"
          },
          {
            "name": "Middle"
          },
          {
            "name": "High"
          }
        ]
      }
    },
    {
      "name": "LimitCheckType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Borrowable"
          },
          {
            "name": "Liquidation"
          },
          {
            "name": "Bankrupt"
          }
        ]
      }
    },
    {
      "name": "UserReserveUsingType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Credit"
          },
          {
            "name": "Debit"
          },
          {
            "name": "Idle"
          }
        ]
      }
    },
    {
      "name": "SecurityCheckType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Borrowable"
          },
          {
            "name": "Liquidation"
          },
          {
            "name": "Bankrupt"
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
          }
        ]
      }
    },
    {
      "name": "PriceBias",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Low"
          },
          {
            "name": "High"
          }
        ]
      }
    },
    {
      "name": "OraclePriceType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "TimeWeighted"
          },
          {
            "name": "RealTime"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "NxlendMarketCreateEvent",
      "fields": [
        {
          "name": "header",
          "type": {
            "defined": "MarketEventHeader"
          },
          "index": false
        }
      ]
    },
    {
      "name": "SetupNewMarketManagerEvent",
      "fields": [
        {
          "name": "header",
          "type": {
            "defined": "MarketEventHeader"
          },
          "index": false
        },
        {
          "name": "newManager",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "LendingPoolReserveCreateEvent",
      "fields": [
        {
          "name": "header",
          "type": {
            "defined": "MarketEventHeader"
          },
          "index": false
        },
        {
          "name": "reserve",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "LendingPoolReserveConfigureEvent",
      "fields": [
        {
          "name": "header",
          "type": {
            "defined": "MarketEventHeader"
          },
          "index": false
        },
        {
          "name": "reserve",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": {
            "defined": "ReserveSettingUpdate"
          },
          "index": false
        }
      ]
    },
    {
      "name": "LendingPoolReserveAccrueInterestEvent",
      "fields": [
        {
          "name": "header",
          "type": {
            "defined": "MarketEventHeader"
          },
          "index": false
        },
        {
          "name": "reserve",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "delta",
          "type": "u64",
          "index": false
        },
        {
          "name": "feesCollected",
          "type": "f64",
          "index": false
        },
        {
          "name": "insuranceCollected",
          "type": "f64",
          "index": false
        }
      ]
    },
    {
      "name": "LendingPoolReserveCollectFeesEvent",
      "fields": [
        {
          "name": "header",
          "type": {
            "defined": "MarketEventHeader"
          },
          "index": false
        },
        {
          "name": "reserve",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "marketFeesCollected",
          "type": "f64",
          "index": false
        },
        {
          "name": "marketFeesOutstanding",
          "type": "f64",
          "index": false
        },
        {
          "name": "insuranceFeesCollected",
          "type": "f64",
          "index": false
        },
        {
          "name": "insuranceFeesOutstanding",
          "type": "f64",
          "index": false
        }
      ]
    },
    {
      "name": "LendingPoolReserveHandleReserveruptcyEvent",
      "fields": [
        {
          "name": "header",
          "type": {
            "defined": "AccountEventHeader"
          },
          "index": false
        },
        {
          "name": "reserve",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "badDebt",
          "type": "f64",
          "index": false
        },
        {
          "name": "coveredAmount",
          "type": "f64",
          "index": false
        },
        {
          "name": "socializedAmount",
          "type": "f64",
          "index": false
        }
      ]
    },
    {
      "name": "NxlendAccountCreateEvent",
      "fields": [
        {
          "name": "header",
          "type": {
            "defined": "AccountEventHeader"
          },
          "index": false
        }
      ]
    },
    {
      "name": "LendingAccountDepositEvent",
      "fields": [
        {
          "name": "header",
          "type": {
            "defined": "AccountEventHeader"
          },
          "index": false
        },
        {
          "name": "reserve",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "LendingAccountRepayEvent",
      "fields": [
        {
          "name": "header",
          "type": {
            "defined": "AccountEventHeader"
          },
          "index": false
        },
        {
          "name": "reserve",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "closeBalance",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "LendingAccountBorrowEvent",
      "fields": [
        {
          "name": "header",
          "type": {
            "defined": "AccountEventHeader"
          },
          "index": false
        },
        {
          "name": "reserve",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "LendingAccountWithdrawEvent",
      "fields": [
        {
          "name": "header",
          "type": {
            "defined": "AccountEventHeader"
          },
          "index": false
        },
        {
          "name": "reserve",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "closeBalance",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "LendingAccountLiquidateEvent",
      "fields": [
        {
          "name": "header",
          "type": {
            "defined": "AccountEventHeader"
          },
          "index": false
        },
        {
          "name": "liquidateeNxlendAccount",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "liquidateeNxlendAccountAuthority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "assetReserve",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "assetMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "liabilityReserve",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "liabilityMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "liquidateePreHealth",
          "type": "f64",
          "index": false
        },
        {
          "name": "liquidateePostHealth",
          "type": "f64",
          "index": false
        },
        {
          "name": "preBalances",
          "type": {
            "defined": "LiquidationBalances"
          },
          "index": false
        },
        {
          "name": "postBalances",
          "type": {
            "defined": "LiquidationBalances"
          },
          "index": false
        }
      ]
    },
    {
      "name": "NxlendAccountTransferAccountAuthorityEvent",
      "fields": [
        {
          "name": "header",
          "type": {
            "defined": "AccountEventHeader"
          },
          "index": false
        },
        {
          "name": "oldAccountAuthority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newAccountAuthority",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "CalcError",
      "msg": "Calc error"
    },
    {
      "code": 6001,
      "name": "Reserve404",
      "msg": "Non-existent reserve"
    },
    {
      "code": 6002,
      "name": "LendingAccountBalance404",
      "msg": "Non-existent lending account balance"
    },
    {
      "code": 6003,
      "name": "RejectByDepositLimit",
      "msg": "Reject by deposit limit"
    },
    {
      "code": 6004,
      "name": "TransferError",
      "msg": "Transfer error"
    },
    {
      "code": 6005,
      "name": "NeedPythOrReserveAccount",
      "msg": "Need Pyth or Reserve account"
    },
    {
      "code": 6006,
      "name": "NeedPythAccount",
      "msg": "Need Pyth account"
    },
    {
      "code": 6007,
      "name": "InvalidOracleAccount",
      "msg": "Invalid Oracle account"
    },
    {
      "code": 6008,
      "name": "NeedReserveAccount",
      "msg": "Need Reserve account"
    },
    {
      "code": 6009,
      "name": "InvalidReserveAccount",
      "msg": "Invalid Reserve account"
    },
    {
      "code": 6010,
      "name": "BadAccountHealth",
      "msg": "Bad account health"
    },
    {
      "code": 6011,
      "name": "LendingAccountBalanceSlotsFull",
      "msg": "Lending account balance slots are full"
    },
    {
      "code": 6012,
      "name": "ReserveAlreadyExists",
      "msg": "Reserve already exists"
    },
    {
      "code": 6013,
      "name": "IllegalLiquidation",
      "msg": "Illegal liquidation"
    },
    {
      "code": 6014,
      "name": "AccountNotBankrupt",
      "msg": "Account is not in bankrupt state"
    },
    {
      "code": 6015,
      "name": "NotBadDebt",
      "msg": "Account is not bad debt"
    },
    {
      "code": 6016,
      "name": "InvalidMarketConfig",
      "msg": "Invalid market config"
    },
    {
      "code": 6017,
      "name": "StaleOracle",
      "msg": "Stale oracle data"
    },
    {
      "code": 6018,
      "name": "ReservePaused",
      "msg": "Reserve paused"
    },
    {
      "code": 6019,
      "name": "ReserveReduceOnly",
      "msg": "Reserve is ReduceOnly mode"
    },
    {
      "code": 6020,
      "name": "ReserveAccoutNotFound",
      "msg": "Reserve is missing"
    },
    {
      "code": 6021,
      "name": "OperationDepositOnly",
      "msg": "Operation is deposit-only"
    },
    {
      "code": 6022,
      "name": "OperationWithdrawOnly",
      "msg": "Operation is withdraw-only"
    },
    {
      "code": 6023,
      "name": "OperationBorrowOnly",
      "msg": "Operation is borrow-only"
    },
    {
      "code": 6024,
      "name": "OperationRepayOnly",
      "msg": "Operation is repay-only"
    },
    {
      "code": 6025,
      "name": "NoAsset",
      "msg": "No asset"
    },
    {
      "code": 6026,
      "name": "NoLiability",
      "msg": "No liability"
    },
    {
      "code": 6027,
      "name": "InvalidOracleSetup",
      "msg": "Invalid oracle setup"
    },
    {
      "code": 6028,
      "name": "IllegalUtilizationRatio",
      "msg": "Invalid reserve utilization ratio"
    },
    {
      "code": 6029,
      "name": "ReserveLiabilityCapacityExceeded",
      "msg": "Reserve borrow cap exceeded"
    },
    {
      "code": 6030,
      "name": "InvalidPrice",
      "msg": "Invalid Price"
    },
    {
      "code": 6031,
      "name": "IsolatedAccountIllegalState",
      "msg": "Account can have only one liablity when account is under isolated risk"
    },
    {
      "code": 6032,
      "name": "EmissionsAlreadySetup",
      "msg": "Emissions already setup"
    },
    {
      "code": 6033,
      "name": "OracleNotSetup",
      "msg": "Oracle is not set"
    },
    {
      "code": 6034,
      "name": "InvalidSwitchboardDecimalConversion",
      "msg": "Invalid swithcboard decimal conversion"
    },
    {
      "code": 6035,
      "name": "CannotCloseOutstandingEmissions",
      "msg": "Cannot close balance because of outstanding emissions"
    },
    {
      "code": 6036,
      "name": "EmissionsUpdateError",
      "msg": "Update emissions error"
    },
    {
      "code": 6037,
      "name": "AccountDisabled",
      "msg": "Account disabled"
    },
    {
      "code": 6038,
      "name": "AccountTempActiveBalanceLimitExceeded",
      "msg": "Account can't temporarily open 3 balances, please close a balance first"
    },
    {
      "code": 6039,
      "name": "AccountInFlashloan",
      "msg": "Illegal action during flashloan"
    },
    {
      "code": 6040,
      "name": "IllegalFlashloan",
      "msg": "Illegal flashloan"
    },
    {
      "code": 6041,
      "name": "IllegalFlag",
      "msg": "Illegal flag"
    },
    {
      "code": 6042,
      "name": "IllegalBalanceState",
      "msg": "Illegal balance state"
    },
    {
      "code": 6043,
      "name": "IllegalAccountAuthorityTransfer",
      "msg": "Illegal account authority transfer"
    },
    {
      "code": 6044,
      "name": "AssetEqualDebt",
      "msg": "Asset mint should not equal to debt"
    },
    {
      "code": 6045,
      "name": "InvalidRepayLTV",
      "msg": "Invalid repay ltv"
    },
    {
      "code": 6046,
      "name": "InvalidRateChangeUR",
      "msg": "Invalid rate_change_ur"
    },
    {
      "code": 6047,
      "name": "InvalidRateChangeIR",
      "msg": "Invalid ir"
    },
    {
      "code": 6048,
      "name": "InvalidWithdrawAmount",
      "msg": "Invalid withdraw amount"
    },
    {
      "code": 6049,
      "name": "InvalidRepayAmount",
      "msg": "Invalid repay amount"
    },
    {
      "code": 6050,
      "name": "InvalidMaxPirceAge",
      "msg": "Reserve max price age exceed the limit"
    }
  ],
  "metadata": {
    "address": "7YYkqwXp812NMe6nWny2JAGsm6b3CVvbQKiMo8SuaPMg"
  }
}