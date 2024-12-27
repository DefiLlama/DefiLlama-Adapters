module.exports= { 
    "events": [
      {
        "name": "AstrolendGroupCreateEvent",
        "discriminator": [
          224, 227, 83, 89,
          213, 232, 38, 60
        ],
        "fields": [
          {
            "name": "header",
            "type": {
              "defined": "GroupEventHeader"
            },
            "index": false
          }
        ]
      },
      {
        "name": "AstrolendGroupConfigureEvent",
        "discriminator": [
          16, 134,  8, 183,
         170, 175, 42, 185
       ],
        "fields": [
          {
            "name": "header",
            "type": {
              "defined": "GroupEventHeader"
            },
            "index": false
          },
          {
            "name": "config",
            "type": {
              "defined": "GroupConfig"
            },
            "index": false
          }
        ]
      },
      {
        "name": "LendingPoolBankCreateEvent",
        "discriminator": [
          236, 220, 201,
           63, 239, 126,
          136, 249
        ],
        "fields": [
          {
            "name": "header",
            "type": {
              "defined": "GroupEventHeader"
            },
            "index": false
          },
          {
            "name": "bank",
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
        "name": "LendingPoolBankConfigureEvent",
        "discriminator": [
          246,  35, 233, 110,
           93, 152, 235,  40
        ],
        "fields": [
          {
            "name": "header",
            "type": {
              "defined": "GroupEventHeader"
            },
            "index": false
          },
          {
            "name": "bank",
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
              "defined": "BankConfigOptArg"
            },
            "index": false
          }
        ]
      },
      {
        "name": "LendingPoolBankAccrueInterestEvent",
       "discriminator": [
          166, 160, 249, 154,
          183,  39,  23, 242
        ],
        "fields": [
          {
            "name": "header",
            "type": {
              "defined": "GroupEventHeader"
            },
            "index": false
          },
          {
            "name": "bank",
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
        "name": "LendingPoolBankCollectFeesEvent",
        "discriminator": [
          101, 119,  97,
          250, 169, 175,
          156, 253
        ],
        "fields": [
          {
            "name": "header",
            "type": {
              "defined": "GroupEventHeader"
            },
            "index": false
          },
          {
            "name": "bank",
            "type": "publicKey",
            "index": false
          },
          {
            "name": "mint",
            "type": "publicKey",
            "index": false
          },
          {
            "name": "groupFeesCollected",
            "type": "f64",
            "index": false
          },
          {
            "name": "groupFeesOutstanding",
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
        "name": "LendingPoolBankHandleBankruptcyEvent",
        "discriminator": [
          166, 77, 41, 140,
           36, 94, 10,  57
        ],
        "fields": [
          {
            "name": "header",
            "type": {
              "defined": "AccountEventHeader"
            },
            "index": false
          },
          {
            "name": "bank",
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
        "name": "AstrolendAccountCreateEvent",
        "discriminator": [
          129, 31,  78, 255,
           88, 50, 243,  95
        ],
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
  "discriminator":
        [
          104, 117, 187,
          156, 111, 154,
          106, 186
        ],
        "fields": [
          {
            "name": "header",
            "type": {
              "defined": "AccountEventHeader"
            },
            "index": false
          },
          {
            "name": "bank",
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
        "discriminator": [16, 220, 55, 111, 7, 80, 16, 25],
        "fields": [
          {
            "name": "header",
            "type": {
              "defined": "AccountEventHeader"
            },
            "index": false
          },
          {
            "name": "bank",
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
        "discriminator": [
          104, 117, 187,
          156, 111, 154,
          106, 186
        ],
        "fields": [
          {
            "name": "header",
            "type": {
              "defined": "AccountEventHeader"
            },
            "index": false
          },
          {
            "name": "bank",
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
        "discriminator": [
          16, 220, 55, 111,
           7,  80, 16,  25
        ],
        "fields": [
          {
            "name": "header",
            "type": {
              "defined": "AccountEventHeader"
            },
            "index": false
          },
          {
            "name": "bank",
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
        "discriminator":[
          166, 160, 249, 154,
          183,  39,  23, 242
        ],
        "fields": [
          {
            "name": "header",
            "type": {
              "defined": "AccountEventHeader"
            },
            "index": false
          },
          {
            "name": "liquidateeAstrolendAccount",
            "type": "publicKey",
            "index": false
          },
          {
            "name": "liquidateeAstrolendAccountAuthority",
            "type": "publicKey",
            "index": false
          },
          {
            "name": "assetBank",
            "type": "publicKey",
            "index": false
          },
          {
            "name": "assetMint",
            "type": "publicKey",
            "index": false
          },
          {
            "name": "liabilityBank",
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
      }
    ],
    "accounts": [
      {
        "discriminator": [52, 227, 40, 246, 147, 146, 69, 219],
        "name": "AstrolendAccount"
      },
      {
        "discriminator": [25, 102, 30, 19, 109, 109, 80, 7],
        "name": "AstrolendGroup"
      },
      {
        "discriminator": [142, 49, 166, 242, 50, 66, 97, 188],
        "name": "Bank"
      }
    ],
    "address": "Astro1oWvtB7cBTwi3efLMFB47WXx7DJDQeoxi235kA",
    "instructions": [
      {
        "accounts": [
          {
            "name": "astrolend_account",
            "writable": true
          },
          {
            "name": "authority",
            "signer": true
          },
          {
            "name": "fee_payer",
            "signer": true,
            "writable": true
          }
        ],
        "args": [],
        "discriminator": [185, 37, 57, 73, 252, 224, 14, 132],
        "name": "astrolend_account_close"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "astrolend_account",
            "signer": true,
            "writable": true
          },
          {
            "name": "authority",
            "signer": true
          },
          {
            "name": "fee_payer",
            "signer": true,
            "writable": true
          },
          {
            "address": "11111111111111111111111111111111",
            "name": "system_program"
          }
        ],
        "args": [],
        "discriminator": [62, 220, 16, 240, 167, 236, 72, 107],
        "docs": ["Initialize a astrolend account for a given group"],
        "name": "astrolend_account_initialize"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group",
            "writable": true
          },
          {
            "name": "admin",
            "signer": true
          }
        ],
        "args": [
          {
            "name": "config",
            "type": {
              "defined": {
                "name": "GroupConfig"
              }
            }
          }
        ],
        "discriminator": [250, 78, 104, 254, 18, 17, 57, 193],
        "name": "astrolend_group_configure"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group",
            "signer": true,
            "writable": true
          },
          {
            "name": "admin",
            "signer": true,
            "writable": true
          },
          {
            "address": "11111111111111111111111111111111",
            "name": "system_program"
          }
        ],
        "args": [],
        "discriminator": [174, 208, 157, 26, 161, 25, 120, 80],
        "name": "astrolend_group_initialize"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "astrolend_account",
            "writable": true
          },
          {
            "name": "signer",
            "signer": true
          },
          {
            "name": "bank",
            "writable": true
          },
          {
            "name": "destination_token_account",
            "writable": true
          },
          {
            "name": "bank_liquidity_vault_authority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108, 105, 113, 117, 105, 100, 105, 116, 121, 95, 118, 97, 117,
                    108, 116, 95, 97, 117, 116, 104
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "bank_liquidity_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108, 105, 113, 117, 105, 100, 105, 116, 121, 95, 118, 97, 117,
                    108, 116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "token_program"
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          }
        ],
        "discriminator": [4, 126, 116, 53, 48, 5, 212, 31],
        "name": "lending_account_borrow"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "astrolend_account",
            "writable": true
          },
          {
            "name": "signer",
            "signer": true
          },
          {
            "name": "bank",
            "writable": true
          }
        ],
        "args": [],
        "discriminator": [245, 54, 41, 4, 243, 202, 31, 17],
        "name": "lending_account_close_balance"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "astrolend_account",
            "writable": true
          },
          {
            "name": "signer",
            "signer": true
          },
          {
            "name": "bank",
            "writable": true
          },
          {
            "name": "signer_token_account",
            "writable": true
          },
          {
            "name": "bank_liquidity_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108, 105, 113, 117, 105, 100, 105, 116, 121, 95, 118, 97, 117,
                    108, 116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "token_program"
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          }
        ],
        "discriminator": [171, 94, 235, 103, 82, 64, 212, 140],
        "name": "lending_account_deposit"
      },
      {
        "accounts": [
          {
            "name": "astrolend_account",
            "writable": true
          },
          {
            "name": "signer",
            "signer": true
          }
        ],
        "args": [],
        "discriminator": [105, 124, 201, 106, 153, 2, 8, 156],
        "name": "lending_account_end_flashloan"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "asset_bank",
            "writable": true
          },
          {
            "name": "liab_bank",
            "writable": true
          },
          {
            "name": "liquidator_astrolend_account",
            "writable": true
          },
          {
            "name": "signer",
            "signer": true
          },
          {
            "name": "liquidatee_astrolend_account",
            "writable": true
          },
          {
            "name": "bank_liquidity_vault_authority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108, 105, 113, 117, 105, 100, 105, 116, 121, 95, 118, 97, 117,
                    108, 116, 95, 97, 117, 116, 104
                  ]
                },
                {
                  "kind": "account",
                  "path": "liab_bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "bank_liquidity_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108, 105, 113, 117, 105, 100, 105, 116, 121, 95, 118, 97, 117,
                    108, 116
                  ]
                },
                {
                  "kind": "account",
                  "path": "liab_bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "bank_insurance_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    105, 110, 115, 117, 114, 97, 110, 99, 101, 95, 118, 97, 117,
                    108, 116
                  ]
                },
                {
                  "kind": "account",
                  "path": "liab_bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "token_program"
          }
        ],
        "args": [
          {
            "name": "asset_amount",
            "type": "u64"
          }
        ],
        "discriminator": [214, 169, 151, 213, 251, 167, 86, 219],
        "docs": [
          "Liquidate a lending account balance of an unhealthy astrolend account"
        ],
        "name": "lending_account_liquidate"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "astrolend_account",
            "writable": true
          },
          {
            "name": "signer",
            "signer": true
          },
          {
            "name": "bank",
            "writable": true
          },
          {
            "name": "signer_token_account",
            "writable": true
          },
          {
            "name": "bank_liquidity_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108, 105, 113, 117, 105, 100, 105, 116, 121, 95, 118, 97, 117,
                    108, 116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "token_program"
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "repay_all",
            "type": {
              "option": "bool"
            }
          }
        ],
        "discriminator": [79, 209, 172, 177, 222, 51, 173, 151],
        "name": "lending_account_repay"
      },
      {
        "accounts": [
          {
            "name": "astrolend_account",
            "writable": true
          },
          {
            "name": "bank",
            "writable": true
          }
        ],
        "args": [],
        "discriminator": [161, 58, 136, 174, 242, 223, 156, 176],
        "name": "lending_account_settle_emissions"
      },
      {
        "accounts": [
          {
            "name": "astrolend_account",
            "writable": true
          },
          {
            "name": "signer",
            "signer": true
          },
          {
            "address": "Sysvar1nstructions1111111111111111111111111",
            "name": "ixs_sysvar"
          }
        ],
        "args": [
          {
            "name": "end_index",
            "type": "u64"
          }
        ],
        "discriminator": [14, 131, 33, 220, 81, 186, 180, 107],
        "name": "lending_account_start_flashloan"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "astrolend_account",
            "writable": true
          },
          {
            "name": "signer",
            "signer": true
          },
          {
            "name": "bank",
            "writable": true
          },
          {
            "name": "destination_token_account",
            "writable": true
          },
          {
            "name": "bank_liquidity_vault_authority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108, 105, 113, 117, 105, 100, 105, 116, 121, 95, 118, 97, 117,
                    108, 116, 95, 97, 117, 116, 104
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "bank_liquidity_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108, 105, 113, 117, 105, 100, 105, 116, 121, 95, 118, 97, 117,
                    108, 116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "token_program"
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "withdraw_all",
            "type": {
              "option": "bool"
            }
          }
        ],
        "discriminator": [36, 72, 74, 19, 210, 210, 192, 192],
        "name": "lending_account_withdraw"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "astrolend_account",
            "writable": true
          },
          {
            "name": "signer",
            "signer": true
          },
          {
            "name": "bank",
            "writable": true
          },
          {
            "name": "emissions_mint"
          },
          {
            "name": "emissions_auth",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101, 109, 105, 115, 115, 105, 111, 110, 115, 95, 97, 117, 116,
                    104, 95, 115, 101, 101, 100
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                },
                {
                  "kind": "account",
                  "path": "emissions_mint"
                }
              ]
            }
          },
          {
            "name": "emissions_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101, 109, 105, 115, 115, 105, 111, 110, 115, 95, 116, 111,
                    107, 101, 110, 95, 97, 99, 99, 111, 117, 110, 116, 95, 115,
                    101, 101, 100
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                },
                {
                  "kind": "account",
                  "path": "emissions_mint"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "destination_account",
            "writable": true
          },
          {
            "name": "token_program"
          }
        ],
        "args": [],
        "discriminator": [234, 22, 84, 214, 118, 176, 140, 170],
        "name": "lending_account_withdraw_emissions"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "bank",
            "writable": true
          }
        ],
        "args": [],
        "discriminator": [108, 201, 30, 87, 47, 65, 97, 188],
        "name": "lending_pool_accrue_bank_interest"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "admin",
            "signer": true,
            "writable": true
          },
          {
            "name": "fee_payer",
            "signer": true,
            "writable": true
          },
          {
            "name": "bank_mint"
          },
          {
            "name": "bank",
            "signer": true,
            "writable": true
          },
          {
            "name": "liquidity_vault_authority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108, 105, 113, 117, 105, 100, 105, 116, 121, 95, 118, 97, 117,
                    108, 116, 95, 97, 117, 116, 104
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            }
          },
          {
            "name": "liquidity_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108, 105, 113, 117, 105, 100, 105, 116, 121, 95, 118, 97, 117,
                    108, 116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "insurance_vault_authority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    105, 110, 115, 117, 114, 97, 110, 99, 101, 95, 118, 97, 117,
                    108, 116, 95, 97, 117, 116, 104
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            }
          },
          {
            "name": "insurance_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    105, 110, 115, 117, 114, 97, 110, 99, 101, 95, 118, 97, 117,
                    108, 116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "fee_vault_authority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    102, 101, 101, 95, 118, 97, 117, 108, 116, 95, 97, 117, 116,
                    104
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            }
          },
          {
            "name": "fee_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [102, 101, 101, 95, 118, 97, 117, 108, 116]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "address": "SysvarRent111111111111111111111111111111111",
            "name": "rent"
          },
          {
            "name": "token_program"
          },
          {
            "address": "11111111111111111111111111111111",
            "name": "system_program"
          }
        ],
        "args": [
          {
            "name": "bank_config",
            "type": {
              "defined": {
                "name": "BankConfigCompact"
              }
            }
          }
        ],
        "discriminator": [215, 68, 72, 78, 208, 218, 103, 182],
        "name": "lending_pool_add_bank"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "admin",
            "signer": true,
            "writable": true
          },
          {
            "name": "fee_payer",
            "signer": true,
            "writable": true
          },
          {
            "name": "bank_mint"
          },
          {
            "name": "bank",
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "astrolend_group"
                },
                {
                  "kind": "account",
                  "path": "bank_mint"
                },
                {
                  "kind": "arg",
                  "path": "bank_seed"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "liquidity_vault_authority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108, 105, 113, 117, 105, 100, 105, 116, 121, 95, 118, 97, 117,
                    108, 116, 95, 97, 117, 116, 104
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            }
          },
          {
            "name": "liquidity_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108, 105, 113, 117, 105, 100, 105, 116, 121, 95, 118, 97, 117,
                    108, 116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "insurance_vault_authority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    105, 110, 115, 117, 114, 97, 110, 99, 101, 95, 118, 97, 117,
                    108, 116, 95, 97, 117, 116, 104
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            }
          },
          {
            "name": "insurance_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    105, 110, 115, 117, 114, 97, 110, 99, 101, 95, 118, 97, 117,
                    108, 116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "fee_vault_authority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    102, 101, 101, 95, 118, 97, 117, 108, 116, 95, 97, 117, 116,
                    104
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            }
          },
          {
            "name": "fee_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [102, 101, 101, 95, 118, 97, 117, 108, 116]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "address": "SysvarRent111111111111111111111111111111111",
            "name": "rent"
          },
          {
            "name": "token_program"
          },
          {
            "address": "11111111111111111111111111111111",
            "name": "system_program"
          }
        ],
        "args": [
          {
            "name": "bank_config",
            "type": {
              "defined": {
                "name": "BankConfigCompact"
              }
            }
          },
          {
            "name": "bank_seed",
            "type": "u64"
          }
        ],
        "discriminator": [76, 211, 213, 171, 117, 78, 158, 76],
        "docs": [
          "A copy of lending_pool_add_bank with an additional bank seed.",
          "This seed is used to create a PDA for the bank's signature.",
          "lending_pool_add_bank is preserved for backwards compatibility."
        ],
        "name": "lending_pool_add_bank_with_seed"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "bank",
            "writable": true
          },
          {
            "name": "liquidity_vault_authority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108, 105, 113, 117, 105, 100, 105, 116, 121, 95, 118, 97, 117,
                    108, 116, 95, 97, 117, 116, 104
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            }
          },
          {
            "name": "liquidity_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108, 105, 113, 117, 105, 100, 105, 116, 121, 95, 118, 97, 117,
                    108, 116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "insurance_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    105, 110, 115, 117, 114, 97, 110, 99, 101, 95, 118, 97, 117,
                    108, 116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "fee_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [102, 101, 101, 95, 118, 97, 117, 108, 116]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "token_program"
          }
        ],
        "args": [],
        "discriminator": [201, 5, 215, 116, 230, 92, 75, 150],
        "name": "lending_pool_collect_bank_fees"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "admin",
            "signer": true
          },
          {
            "name": "bank",
            "writable": true
          }
        ],
        "args": [
          {
            "name": "bank_config_opt",
            "type": {
              "defined": {
                "name": "BankConfigOpt"
              }
            }
          }
        ],
        "discriminator": [121, 173, 156, 40, 93, 148, 56, 237],
        "name": "lending_pool_configure_bank"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "signer",
            "signer": true
          },
          {
            "name": "bank",
            "writable": true
          },
          {
            "name": "astrolend_account",
            "writable": true
          },
          {
            "name": "liquidity_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    108, 105, 113, 117, 105, 100, 105, 116, 121, 95, 118, 97, 117,
                    108, 116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "insurance_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    105, 110, 115, 117, 114, 97, 110, 99, 101, 95, 118, 97, 117,
                    108, 116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "insurance_vault_authority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    105, 110, 115, 117, 114, 97, 110, 99, 101, 95, 118, 97, 117,
                    108, 116, 95, 97, 117, 116, 104
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            }
          },
          {
            "name": "token_program"
          }
        ],
        "args": [],
        "discriminator": [162, 11, 56, 139, 90, 128, 70, 173],
        "docs": [
          "Handle bad debt of a bankrupt astrolend account for a given bank."
        ],
        "name": "lending_pool_handle_bankruptcy"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "admin",
            "signer": true,
            "writable": true
          },
          {
            "name": "bank",
            "writable": true
          },
          {
            "name": "emissions_mint"
          },
          {
            "name": "emissions_auth",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101, 109, 105, 115, 115, 105, 111, 110, 115, 95, 97, 117, 116,
                    104, 95, 115, 101, 101, 100
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                },
                {
                  "kind": "account",
                  "path": "emissions_mint"
                }
              ]
            }
          },
          {
            "name": "emissions_token_account",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101, 109, 105, 115, 115, 105, 111, 110, 115, 95, 116, 111,
                    107, 101, 110, 95, 97, 99, 99, 111, 117, 110, 116, 95, 115,
                    101, 101, 100
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                },
                {
                  "kind": "account",
                  "path": "emissions_mint"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "emissions_funding_account",
            "writable": true
          },
          {
            "name": "token_program"
          },
          {
            "address": "11111111111111111111111111111111",
            "name": "system_program"
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
            "name": "total_emissions",
            "type": "u64"
          }
        ],
        "discriminator": [206, 97, 120, 172, 113, 204, 169, 70],
        "name": "lending_pool_setup_emissions"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "admin",
            "signer": true,
            "writable": true
          },
          {
            "name": "bank",
            "writable": true
          },
          {
            "name": "emissions_mint"
          },
          {
            "name": "emissions_token_account",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    101, 109, 105, 115, 115, 105, 111, 110, 115, 95, 116, 111,
                    107, 101, 110, 95, 97, 99, 99, 111, 117, 110, 116, 95, 115,
                    101, 101, 100
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                },
                {
                  "kind": "account",
                  "path": "emissions_mint"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "emissions_funding_account",
            "writable": true
          },
          {
            "name": "token_program"
          }
        ],
        "args": [
          {
            "name": "emissions_flags",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "emissions_rate",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "additional_emissions",
            "type": {
              "option": "u64"
            }
          }
        ],
        "discriminator": [55, 213, 224, 168, 153, 53, 197, 40],
        "name": "lending_pool_update_emissions_parameters"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "bank"
          },
          {
            "name": "admin",
            "signer": true
          },
          {
            "name": "fee_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [102, 101, 101, 95, 118, 97, 117, 108, 116]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "fee_vault_authority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    102, 101, 101, 95, 118, 97, 117, 108, 116, 95, 97, 117, 116,
                    104
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            }
          },
          {
            "name": "dst_token_account",
            "writable": true
          },
          {
            "name": "token_program"
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          }
        ],
        "discriminator": [92, 140, 215, 254, 170, 0, 83, 174],
        "name": "lending_pool_withdraw_fees"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "bank"
          },
          {
            "name": "admin",
            "signer": true
          },
          {
            "name": "insurance_vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    105, 110, 115, 117, 114, 97, 110, 99, 101, 95, 118, 97, 117,
                    108, 116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            },
            "writable": true
          },
          {
            "name": "insurance_vault_authority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    105, 110, 115, 117, 114, 97, 110, 99, 101, 95, 118, 97, 117,
                    108, 116, 95, 97, 117, 116, 104
                  ]
                },
                {
                  "kind": "account",
                  "path": "bank"
                }
              ]
            }
          },
          {
            "name": "dst_token_account",
            "writable": true
          },
          {
            "name": "token_program"
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          }
        ],
        "discriminator": [108, 60, 60, 246, 104, 79, 159, 243],
        "name": "lending_pool_withdraw_insurance"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "astrolend_account",
            "writable": true
          },
          {
            "docs": ["Admin only"],
            "name": "admin",
            "signer": true
          }
        ],
        "args": [
          {
            "name": "flag",
            "type": "u64"
          }
        ],
        "discriminator": [56, 238, 18, 207, 193, 82, 138, 174],
        "name": "set_account_flag"
      },
      {
        "accounts": [
          {
            "name": "astrolend_account",
            "writable": true
          },
          {
            "name": "astrolend_group"
          },
          {
            "name": "signer",
            "signer": true
          },
          {
            "name": "new_authority"
          },
          {
            "name": "fee_payer",
            "signer": true,
            "writable": true
          }
        ],
        "args": [],
        "discriminator": [153, 162, 50, 84, 182, 201, 74, 179],
        "name": "set_new_account_authority"
      },
      {
        "accounts": [
          {
            "name": "astrolend_group"
          },
          {
            "name": "astrolend_account",
            "writable": true
          },
          {
            "docs": ["Admin only"],
            "name": "admin",
            "signer": true
          }
        ],
        "args": [
          {
            "name": "flag",
            "type": "u64"
          }
        ],
        "discriminator": [56, 81, 56, 85, 92, 49, 255, 70],
        "name": "unset_account_flag"
      }
    ],
    "metadata": {
      "description": "Created with Anchor",
      "name": "astrolend",
      "spec": "0.1.0",
      "version": "0.1.0"
    },
    "types": [
      {
        "name": "AccountEventHeader",
        "type": {
          "fields": [
            {
              "name": "signer",
              "type": {
                "option": "pubkey"
              }
            },
            {
              "name": "astrolend_account",
              "type": "pubkey"
            },
            {
              "name": "astrolend_account_authority",
              "type": "pubkey"
            },
            {
              "name": "astrolend_group",
              "type": "pubkey"
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "AstrolendAccount",
        "repr": {
          "kind": "c"
        },
        "serialization": "bytemuckunsafe",
        "type": {
          "fields": [
            {
              "name": "group",
              "type": "pubkey"
            },
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "lending_account",
              "type": {
                "defined": {
                  "name": "LendingAccount"
                }
              }
            },
            {
              "docs": [
                "The flags that indicate the state of the account.",
                "This is u64 bitfield, where each bit represents a flag.",
                "",
                "Flags:",
                "- DISABLED_FLAG = 1 << 0 = 1 - This flag indicates that the account is disabled,",
                "and no further actions can be taken on it."
              ],
              "name": "account_flags",
              "type": "u64"
            },
            {
              "name": "_padding",
              "type": {
                "array": ["u64", 63]
              }
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "AstrolendAccountCreateEvent",
        "type": {
          "fields": [
            {
              "name": "header",
              "type": {
                "defined": {
                  "name": "AccountEventHeader"
                }
              }
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "AstrolendAccountTransferAccountAuthorityEvent",
        "type": {
          "fields": [
            {
              "name": "header",
              "type": {
                "defined": {
                  "name": "AccountEventHeader"
                }
              }
            },
            {
              "name": "old_account_authority",
              "type": "pubkey"
            },
            {
              "name": "new_account_authority",
              "type": "pubkey"
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "AstrolendGroup",
        "repr": {
          "kind": "c"
        },
        "serialization": "bytemuck",
        "type": {
          "fields": [
            {
              "name": "admin",
              "type": "pubkey"
            },
            {
              "name": "_padding_0",
              "type": {
                "array": [
                  {
                    "array": ["u64", 2]
                  },
                  32
                ]
              }
            },
            {
              "name": "_padding_1",
              "type": {
                "array": [
                  {
                    "array": ["u64", 2]
                  },
                  32
                ]
              }
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "AstrolendGroupConfigureEvent",
        "type": {
          "fields": [
            {
              "name": "header",
              "type": {
                "defined": {
                  "name": "GroupEventHeader"
                }
              }
            },
            {
              "name": "config",
              "type": {
                "defined": {
                  "name": "GroupConfig"
                }
              }
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "AstrolendGroupCreateEvent",
        "type": {
          "fields": [
            {
              "name": "header",
              "type": {
                "defined": {
                  "name": "GroupEventHeader"
                }
              }
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "Balance",
        "repr": {
          "kind": "c"
        },
        "serialization": "bytemuckunsafe",
        "type": {
          "fields": [
            {
              "name": "active",
              "type": "bool"
            },
            {
              "name": "bank_pk",
              "type": "pubkey"
            },
            {
              "name": "_pad0",
              "type": {
                "array": ["u8", 7]
              }
            },
            {
              "name": "asset_shares",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "liability_shares",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "emissions_outstanding",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "last_update",
              "type": "u64"
            },
            {
              "name": "_padding",
              "type": {
                "array": ["u64", 1]
              }
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "Bank",
        "repr": {
          "kind": "c"
        },
        "serialization": "bytemuckunsafe",
        "type": {
          "fields": [
            {
              "name": "mint",
              "type": "pubkey"
            },
            {
              "name": "mint_decimals",
              "type": "u8"
            },
            {
              "name": "group",
              "type": "pubkey"
            },
            {
              "name": "_pad0",
              "type": {
                "array": ["u8", 7]
              }
            },
            {
              "name": "asset_share_value",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "liability_share_value",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "liquidity_vault",
              "type": "pubkey"
            },
            {
              "name": "liquidity_vault_bump",
              "type": "u8"
            },
            {
              "name": "liquidity_vault_authority_bump",
              "type": "u8"
            },
            {
              "name": "insurance_vault",
              "type": "pubkey"
            },
            {
              "name": "insurance_vault_bump",
              "type": "u8"
            },
            {
              "name": "insurance_vault_authority_bump",
              "type": "u8"
            },
            {
              "name": "_pad1",
              "type": {
                "array": ["u8", 4]
              }
            },
            {
              "name": "collected_insurance_fees_outstanding",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "fee_vault",
              "type": "pubkey"
            },
            {
              "name": "fee_vault_bump",
              "type": "u8"
            },
            {
              "name": "fee_vault_authority_bump",
              "type": "u8"
            },
            {
              "name": "_pad2",
              "type": {
                "array": ["u8", 6]
              }
            },
            {
              "name": "collected_group_fees_outstanding",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "total_liability_shares",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "total_asset_shares",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "last_update",
              "type": "i64"
            },
            {
              "name": "config",
              "type": {
                "defined": {
                  "name": "BankConfig"
                }
              }
            },
            {
              "docs": [
                "Bank Config Flags",
                "",
                "- EMISSIONS_FLAG_BORROW_ACTIVE: 1",
                "- EMISSIONS_FLAG_LENDING_ACTIVE: 2",
                "- PERMISSIONLESS_BAD_DEBT_SETTLEMENT: 4",
                ""
              ],
              "name": "flags",
              "type": "u64"
            },
            {
              "docs": [
                "Emissions APR.",
                "Number of emitted tokens (emissions_mint) per 1e(bank.mint_decimal) tokens (bank mint) (native amount) per 1 YEAR."
              ],
              "name": "emissions_rate",
              "type": "u64"
            },
            {
              "name": "emissions_remaining",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "emissions_mint",
              "type": "pubkey"
            },
            {
              "name": "_padding_0",
              "type": {
                "array": [
                  {
                    "array": ["u64", 2]
                  },
                  28
                ]
              }
            },
            {
              "name": "_padding_1",
              "type": {
                "array": [
                  {
                    "array": ["u64", 2]
                  },
                  32
                ]
              }
            }
          ],
          "kind": "struct"
        }
      },
      {
        "docs": [
          "TODO: Convert weights to (u64, u64) to avoid precision loss (maybe?)"
        ],
        "name": "BankConfig",
        "repr": {
          "kind": "c"
        },
        "serialization": "bytemuckunsafe",
        "type": {
          "fields": [
            {
              "name": "asset_weight_init",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "asset_weight_maint",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "liability_weight_init",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "liability_weight_maint",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "deposit_limit",
              "type": "u64"
            },
            {
              "name": "interest_rate_config",
              "type": {
                "defined": {
                  "name": "InterestRateConfig"
                }
              }
            },
            {
              "name": "operational_state",
              "type": {
                "defined": {
                  "name": "BankOperationalState"
                }
              }
            },
            {
              "name": "oracle_setup",
              "type": {
                "defined": {
                  "name": "OracleSetup"
                }
              }
            },
            {
              "name": "oracle_keys",
              "type": {
                "array": ["pubkey", 5]
              }
            },
            {
              "name": "_pad0",
              "type": {
                "array": ["u8", 6]
              }
            },
            {
              "name": "borrow_limit",
              "type": "u64"
            },
            {
              "name": "risk_tier",
              "type": {
                "defined": {
                  "name": "RiskTier"
                }
              }
            },
            {
              "name": "auto_padding_0",
              "type": {
                "array": ["u8", 7]
              }
            },
            {
              "name": "_pad1",
              "type": {
                "array": ["u8", 7]
              }
            },
            {
              "docs": [
                "USD denominated limit for calculating asset value for initialization astrol requirements.",
                "Example, if total SOL deposits are equal to $1M and the limit it set to $500K,",
                "then SOL assets will be discounted by 50%.",
                "",
                "In other words the max value of liabilities that can be backed by the asset is $500K.",
                "This is useful for limiting the damage of orcale attacks.",
                "",
                "Value is UI USD value, for example value 100 -> $100"
              ],
              "name": "total_asset_value_init_limit",
              "type": "u64"
            },
            {
              "docs": [
                "Time window in seconds for the oracle price feed to be considered live."
              ],
              "name": "oracle_max_age",
              "type": "u16"
            },
            {
              "name": "_padding",
              "type": {
                "array": ["u8", 38]
              }
            }
          ],
          "kind": "struct"
        }
      },
      {
        "docs": [
          "TODO: Convert weights to (u64, u64) to avoid precision loss (maybe?)"
        ],
        "name": "BankConfigCompact",
        "repr": {
          "kind": "c"
        },
        "type": {
          "fields": [
            {
              "name": "asset_weight_init",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "asset_weight_maint",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "liability_weight_init",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "liability_weight_maint",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "deposit_limit",
              "type": "u64"
            },
            {
              "name": "interest_rate_config",
              "type": {
                "defined": {
                  "name": "InterestRateConfigCompact"
                }
              }
            },
            {
              "name": "operational_state",
              "type": {
                "defined": {
                  "name": "BankOperationalState"
                }
              }
            },
            {
              "name": "oracle_setup",
              "type": {
                "defined": {
                  "name": "OracleSetup"
                }
              }
            },
            {
              "name": "oracle_key",
              "type": "pubkey"
            },
            {
              "name": "borrow_limit",
              "type": "u64"
            },
            {
              "name": "risk_tier",
              "type": {
                "defined": {
                  "name": "RiskTier"
                }
              }
            },
            {
              "name": "_pad0",
              "type": {
                "array": ["u8", 7]
              }
            },
            {
              "name": "auto_padding_0",
              "type": {
                "array": ["u8", 7]
              }
            },
            {
              "docs": [
                "USD denominated limit for calculating asset value for initialization astrol requirements.",
                "Example, if total SOL deposits are equal to $1M and the limit it set to $500K,",
                "then SOL assets will be discounted by 50%.",
                "",
                "In other words the max value of liabilities that can be backed by the asset is $500K.",
                "This is useful for limiting the damage of orcale attacks.",
                "",
                "Value is UI USD value, for example value 100 -> $100"
              ],
              "name": "total_asset_value_init_limit",
              "type": "u64"
            },
            {
              "docs": [
                "Time window in seconds for the oracle price feed to be considered live."
              ],
              "name": "oracle_max_age",
              "type": "u16"
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "BankConfigOpt",
        "type": {
          "fields": [
            {
              "name": "asset_weight_init",
              "type": {
                "option": {
                  "defined": {
                    "name": "WrappedI80F48"
                  }
                }
              }
            },
            {
              "name": "asset_weight_maint",
              "type": {
                "option": {
                  "defined": {
                    "name": "WrappedI80F48"
                  }
                }
              }
            },
            {
              "name": "liability_weight_init",
              "type": {
                "option": {
                  "defined": {
                    "name": "WrappedI80F48"
                  }
                }
              }
            },
            {
              "name": "liability_weight_maint",
              "type": {
                "option": {
                  "defined": {
                    "name": "WrappedI80F48"
                  }
                }
              }
            },
            {
              "name": "deposit_limit",
              "type": {
                "option": "u64"
              }
            },
            {
              "name": "borrow_limit",
              "type": {
                "option": "u64"
              }
            },
            {
              "name": "operational_state",
              "type": {
                "option": {
                  "defined": {
                    "name": "BankOperationalState"
                  }
                }
              }
            },
            {
              "name": "oracle",
              "type": {
                "option": {
                  "defined": {
                    "name": "OracleConfig"
                  }
                }
              }
            },
            {
              "name": "interest_rate_config",
              "type": {
                "option": {
                  "defined": {
                    "name": "InterestRateConfigOpt"
                  }
                }
              }
            },
            {
              "name": "risk_tier",
              "type": {
                "option": {
                  "defined": {
                    "name": "RiskTier"
                  }
                }
              }
            },
            {
              "name": "total_asset_value_init_limit",
              "type": {
                "option": "u64"
              }
            },
            {
              "name": "oracle_max_age",
              "type": {
                "option": "u16"
              }
            },
            {
              "name": "permissionless_bad_debt_settlement",
              "type": {
                "option": "bool"
              }
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "BankOperationalState",
        "repr": {
          "kind": "rust"
        },
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
        "name": "GroupConfig",
        "type": {
          "fields": [
            {
              "name": "admin",
              "type": {
                "option": "pubkey"
              }
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "GroupEventHeader",
        "type": {
          "fields": [
            {
              "name": "signer",
              "type": {
                "option": "pubkey"
              }
            },
            {
              "name": "astrolend_group",
              "type": "pubkey"
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "InterestRateConfig",
        "repr": {
          "kind": "c"
        },
        "serialization": "bytemuck",
        "type": {
          "fields": [
            {
              "name": "optimal_utilization_rate",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "plateau_interest_rate",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "max_interest_rate",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "insurance_fee_fixed_apr",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "insurance_ir_fee",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "protocol_fixed_fee_apr",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "protocol_ir_fee",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "_padding",
              "type": {
                "array": [
                  {
                    "array": ["u64", 2]
                  },
                  8
                ]
              }
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "InterestRateConfigCompact",
        "repr": {
          "kind": "c"
        },
        "type": {
          "fields": [
            {
              "name": "optimal_utilization_rate",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "plateau_interest_rate",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "max_interest_rate",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "insurance_fee_fixed_apr",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "insurance_ir_fee",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "protocol_fixed_fee_apr",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            },
            {
              "name": "protocol_ir_fee",
              "type": {
                "defined": {
                  "name": "WrappedI80F48"
                }
              }
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "InterestRateConfigOpt",
        "type": {
          "fields": [
            {
              "name": "optimal_utilization_rate",
              "type": {
                "option": {
                  "defined": {
                    "name": "WrappedI80F48"
                  }
                }
              }
            },
            {
              "name": "plateau_interest_rate",
              "type": {
                "option": {
                  "defined": {
                    "name": "WrappedI80F48"
                  }
                }
              }
            },
            {
              "name": "max_interest_rate",
              "type": {
                "option": {
                  "defined": {
                    "name": "WrappedI80F48"
                  }
                }
              }
            },
            {
              "name": "insurance_fee_fixed_apr",
              "type": {
                "option": {
                  "defined": {
                    "name": "WrappedI80F48"
                  }
                }
              }
            },
            {
              "name": "insurance_ir_fee",
              "type": {
                "option": {
                  "defined": {
                    "name": "WrappedI80F48"
                  }
                }
              }
            },
            {
              "name": "protocol_fixed_fee_apr",
              "type": {
                "option": {
                  "defined": {
                    "name": "WrappedI80F48"
                  }
                }
              }
            },
            {
              "name": "protocol_ir_fee",
              "type": {
                "option": {
                  "defined": {
                    "name": "WrappedI80F48"
                  }
                }
              }
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "LendingAccount",
        "repr": {
          "kind": "c"
        },
        "serialization": "bytemuckunsafe",
        "type": {
          "fields": [
            {
              "name": "balances",
              "type": {
                "array": [
                  {
                    "defined": {
                      "name": "Balance"
                    }
                  },
                  16
                ]
              }
            },
            {
              "name": "_padding",
              "type": {
                "array": ["u64", 8]
              }
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "LendingAccountBorrowEvent",
        "type": {
          "fields": [
            {
              "name": "header",
              "type": {
                "defined": {
                  "name": "AccountEventHeader"
                }
              }
            },
            {
              "name": "bank",
              "type": "pubkey"
            },
            {
              "name": "mint",
              "type": "pubkey"
            },
            {
              "name": "amount",
              "type": "u64"
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "LendingAccountDepositEvent",
        "type": {
          "fields": [
            {
              "name": "header",
              "type": {
                "defined": {
                  "name": "AccountEventHeader"
                }
              }
            },
            {
              "name": "bank",
              "type": "pubkey"
            },
            {
              "name": "mint",
              "type": "pubkey"
            },
            {
              "name": "amount",
              "type": "u64"
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "LendingAccountLiquidateEvent",
        "type": {
          "fields": [
            {
              "name": "header",
              "type": {
                "defined": {
                  "name": "AccountEventHeader"
                }
              }
            },
            {
              "name": "liquidatee_astrolend_account",
              "type": "pubkey"
            },
            {
              "name": "liquidatee_astrolend_account_authority",
              "type": "pubkey"
            },
            {
              "name": "asset_bank",
              "type": "pubkey"
            },
            {
              "name": "asset_mint",
              "type": "pubkey"
            },
            {
              "name": "liability_bank",
              "type": "pubkey"
            },
            {
              "name": "liability_mint",
              "type": "pubkey"
            },
            {
              "name": "liquidatee_pre_health",
              "type": "f64"
            },
            {
              "name": "liquidatee_post_health",
              "type": "f64"
            },
            {
              "name": "pre_balances",
              "type": {
                "defined": {
                  "name": "LiquidationBalances"
                }
              }
            },
            {
              "name": "post_balances",
              "type": {
                "defined": {
                  "name": "LiquidationBalances"
                }
              }
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "LendingAccountRepayEvent",
        "type": {
          "fields": [
            {
              "name": "header",
              "type": {
                "defined": {
                  "name": "AccountEventHeader"
                }
              }
            },
            {
              "name": "bank",
              "type": "pubkey"
            },
            {
              "name": "mint",
              "type": "pubkey"
            },
            {
              "name": "amount",
              "type": "u64"
            },
            {
              "name": "close_balance",
              "type": "bool"
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "LendingAccountWithdrawEvent",
        "type": {
          "fields": [
            {
              "name": "header",
              "type": {
                "defined": {
                  "name": "AccountEventHeader"
                }
              }
            },
            {
              "name": "bank",
              "type": "pubkey"
            },
            {
              "name": "mint",
              "type": "pubkey"
            },
            {
              "name": "amount",
              "type": "u64"
            },
            {
              "name": "close_balance",
              "type": "bool"
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "LendingPoolBankAccrueInterestEvent",
        "type": {
          "fields": [
            {
              "name": "header",
              "type": {
                "defined": {
                  "name": "GroupEventHeader"
                }
              }
            },
            {
              "name": "bank",
              "type": "pubkey"
            },
            {
              "name": "mint",
              "type": "pubkey"
            },
            {
              "name": "delta",
              "type": "u64"
            },
            {
              "name": "fees_collected",
              "type": "f64"
            },
            {
              "name": "insurance_collected",
              "type": "f64"
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "LendingPoolBankCollectFeesEvent",
        "type": {
          "fields": [
            {
              "name": "header",
              "type": {
                "defined": {
                  "name": "GroupEventHeader"
                }
              }
            },
            {
              "name": "bank",
              "type": "pubkey"
            },
            {
              "name": "mint",
              "type": "pubkey"
            },
            {
              "name": "group_fees_collected",
              "type": "f64"
            },
            {
              "name": "group_fees_outstanding",
              "type": "f64"
            },
            {
              "name": "insurance_fees_collected",
              "type": "f64"
            },
            {
              "name": "insurance_fees_outstanding",
              "type": "f64"
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "LendingPoolBankConfigureEvent",
        "type": {
          "fields": [
            {
              "name": "header",
              "type": {
                "defined": {
                  "name": "GroupEventHeader"
                }
              }
            },
            {
              "name": "bank",
              "type": "pubkey"
            },
            {
              "name": "mint",
              "type": "pubkey"
            },
            {
              "name": "config",
              "type": {
                "defined": {
                  "name": "BankConfigOpt"
                }
              }
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "LendingPoolBankCreateEvent",
        "type": {
          "fields": [
            {
              "name": "header",
              "type": {
                "defined": {
                  "name": "GroupEventHeader"
                }
              }
            },
            {
              "name": "bank",
              "type": "pubkey"
            },
            {
              "name": "mint",
              "type": "pubkey"
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "LendingPoolBankHandleBankruptcyEvent",
        "type": {
          "fields": [
            {
              "name": "header",
              "type": {
                "defined": {
                  "name": "AccountEventHeader"
                }
              }
            },
            {
              "name": "bank",
              "type": "pubkey"
            },
            {
              "name": "mint",
              "type": "pubkey"
            },
            {
              "name": "bad_debt",
              "type": "f64"
            },
            {
              "name": "covered_amount",
              "type": "f64"
            },
            {
              "name": "socialized_amount",
              "type": "f64"
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "LiquidationBalances",
        "type": {
          "fields": [
            {
              "name": "liquidatee_asset_balance",
              "type": "f64"
            },
            {
              "name": "liquidatee_liability_balance",
              "type": "f64"
            },
            {
              "name": "liquidator_asset_balance",
              "type": "f64"
            },
            {
              "name": "liquidator_liability_balance",
              "type": "f64"
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "OracleConfig",
        "type": {
          "fields": [
            {
              "name": "setup",
              "type": {
                "defined": {
                  "name": "OracleSetup"
                }
              }
            },
            {
              "name": "keys",
              "type": {
                "array": ["pubkey", 5]
              }
            }
          ],
          "kind": "struct"
        }
      },
      {
        "name": "OracleSetup",
        "repr": {
          "kind": "rust"
        },
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "None"
            },
            {
              "name": "PythLegacy"
            },
            {
              "name": "SwitchboardV2"
            },
            {
              "name": "PythPushOracle"
            },
            {
              "name": "SwitchboardPull"
            }
          ]
        }
      },
      {
        "name": "RiskTier",
        "repr": {
          "kind": "rust"
        },
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "Collateral"
            },
            {
              "name": "Isolated"
            }
          ]
        }
      },
      {
        "name": "WrappedI80F48",
        "repr": {
          "align": 8,
          "kind": "c"
        },
        "serialization": "bytemuck",
        "type": {
          "fields": [
            {
              "name": "value",
              "type": {
                "array": ["u8", 16]
              }
            }
          ],
          "kind": "struct"
        }
      }
    ]
  }
  