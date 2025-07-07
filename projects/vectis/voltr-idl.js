module.exports =  {
    "address": "vVoLTRjQmtFpiYoegx285Ze4gsLJ8ZxgFKVcuvmG1a8",
    "metadata": {
      "name": "voltr_vault",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "add_adaptor",
        "discriminator": [
          161,
          145,
          203,
          248,
          211,
          202,
          203,
          67
        ],
        "accounts": [
          {
            "name": "payer",
            "writable": true,
            "signer": true
          },
          {
            "name": "admin",
            "signer": true,
            "relations": [
              "vault"
            ]
          },
          {
            "name": "protocol",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    116,
                    111,
                    99,
                    111,
                    108
                  ]
                }
              ]
            }
          },
          {
            "name": "vault",
            "writable": true
          },
          {
            "name": "adaptor_add_receipt",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    97,
                    100,
                    97,
                    112,
                    116,
                    111,
                    114,
                    95,
                    97,
                    100,
                    100,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "adaptor_program"
                }
              ]
            }
          },
          {
            "name": "adaptor_program"
          },
          {
            "name": "system_program",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "cancel_request_withdraw_vault",
        "discriminator": [
          231,
          54,
          14,
          6,
          223,
          124,
          127,
          238
        ],
        "accounts": [
          {
            "name": "user_transfer_authority",
            "docs": [
              "The authority that owns the LP tokens and wants to redeem them"
            ],
            "writable": true,
            "signer": true
          },
          {
            "name": "protocol",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    116,
                    111,
                    99,
                    111,
                    108
                  ]
                }
              ]
            }
          },
          {
            "name": "vault",
            "writable": true
          },
          {
            "name": "vault_lp_mint",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    108,
                    112,
                    95,
                    109,
                    105,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "user_lp_ata",
            "docs": [
              "The user's LP token account from which LP tokens will be burned."
            ],
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "user_transfer_authority"
                },
                {
                  "kind": "account",
                  "path": "lp_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_lp_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "request_withdraw_lp_ata",
            "docs": [
              "The request's associated token account for LP."
            ],
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "request_withdraw_vault_receipt"
                },
                {
                  "kind": "account",
                  "path": "lp_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_lp_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "request_withdraw_vault_receipt",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    114,
                    101,
                    113,
                    117,
                    101,
                    115,
                    116,
                    95,
                    119,
                    105,
                    116,
                    104,
                    100,
                    114,
                    97,
                    119,
                    95,
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "user_transfer_authority"
                }
              ]
            }
          },
          {
            "name": "lp_token_program",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "system_program",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "close_strategy",
        "discriminator": [
          56,
          247,
          170,
          246,
          89,
          221,
          134,
          200
        ],
        "accounts": [
          {
            "name": "payer",
            "writable": true,
            "signer": true
          },
          {
            "name": "manager",
            "signer": true
          },
          {
            "name": "protocol",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    116,
                    111,
                    99,
                    111,
                    108
                  ]
                }
              ]
            }
          },
          {
            "name": "vault"
          },
          {
            "name": "strategy"
          },
          {
            "name": "strategy_init_receipt",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    114,
                    97,
                    116,
                    101,
                    103,
                    121,
                    95,
                    105,
                    110,
                    105,
                    116,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "strategy"
                }
              ]
            }
          },
          {
            "name": "system_program",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "create_lp_metadata",
        "discriminator": [
          148,
          193,
          160,
          116,
          87,
          25,
          123,
          103
        ],
        "accounts": [
          {
            "name": "payer",
            "writable": true,
            "signer": true
          },
          {
            "name": "admin",
            "signer": true,
            "relations": [
              "vault"
            ]
          },
          {
            "name": "vault"
          },
          {
            "name": "vault_lp_mint",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    108,
                    112,
                    95,
                    109,
                    105,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "vault_lp_mint_auth",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    108,
                    112,
                    95,
                    109,
                    105,
                    110,
                    116,
                    95,
                    97,
                    117,
                    116,
                    104
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "metadata_account",
            "writable": true
          },
          {
            "name": "metadata_program",
            "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
          },
          {
            "name": "rent",
            "address": "SysvarRent111111111111111111111111111111111"
          },
          {
            "name": "system_program",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
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
          }
        ]
      },
      {
        "name": "deposit_strategy",
        "discriminator": [
          246,
          82,
          57,
          226,
          131,
          222,
          253,
          249
        ],
        "accounts": [
          {
            "name": "manager",
            "signer": true
          },
          {
            "name": "protocol",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    116,
                    111,
                    99,
                    111,
                    108
                  ]
                }
              ]
            }
          },
          {
            "name": "vault",
            "writable": true
          },
          {
            "name": "strategy"
          },
          {
            "name": "adaptor_add_receipt",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    97,
                    100,
                    97,
                    112,
                    116,
                    111,
                    114,
                    95,
                    97,
                    100,
                    100,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "adaptor_program"
                }
              ]
            }
          },
          {
            "name": "strategy_init_receipt",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    114,
                    97,
                    116,
                    101,
                    103,
                    121,
                    95,
                    105,
                    110,
                    105,
                    116,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "strategy"
                }
              ]
            }
          },
          {
            "name": "vault_asset_idle_auth",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    97,
                    115,
                    115,
                    101,
                    116,
                    95,
                    105,
                    100,
                    108,
                    101,
                    95,
                    97,
                    117,
                    116,
                    104
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "vault_strategy_auth",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    115,
                    116,
                    114,
                    97,
                    116,
                    101,
                    103,
                    121,
                    95,
                    97,
                    117,
                    116,
                    104
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "strategy"
                }
              ]
            }
          },
          {
            "name": "vault_asset_mint",
            "writable": true
          },
          {
            "name": "vault_lp_mint",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    108,
                    112,
                    95,
                    109,
                    105,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "vault_asset_idle_ata",
            "docs": [
              "The vault's associated token account for asset."
            ],
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "vault_asset_idle_auth"
                },
                {
                  "kind": "account",
                  "path": "asset_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_asset_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "vault_strategy_asset_ata",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "vault_strategy_auth"
                },
                {
                  "kind": "account",
                  "path": "asset_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_asset_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "asset_token_program"
          },
          {
            "name": "adaptor_program"
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "instruction_discriminator",
            "type": {
              "option": "bytes"
            }
          },
          {
            "name": "additional_args",
            "type": {
              "option": "bytes"
            }
          }
        ]
      },
      {
        "name": "deposit_vault",
        "discriminator": [
          126,
          224,
          21,
          255,
          228,
          53,
          117,
          33
        ],
        "accounts": [
          {
            "name": "user_transfer_authority",
            "signer": true
          },
          {
            "name": "protocol",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    116,
                    111,
                    99,
                    111,
                    108
                  ]
                }
              ]
            }
          },
          {
            "name": "vault",
            "writable": true
          },
          {
            "name": "vault_asset_mint"
          },
          {
            "name": "vault_lp_mint",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    108,
                    112,
                    95,
                    109,
                    105,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "user_asset_ata",
            "docs": [
              "The user's asset ATA from which they are depositing tokens."
            ],
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "user_transfer_authority"
                },
                {
                  "kind": "account",
                  "path": "asset_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_asset_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "vault_asset_idle_ata",
            "docs": [
              "The vault's associated token account for asset."
            ],
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "vault_asset_idle_auth"
                },
                {
                  "kind": "account",
                  "path": "asset_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_asset_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "vault_asset_idle_auth",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    97,
                    115,
                    115,
                    101,
                    116,
                    95,
                    105,
                    100,
                    108,
                    101,
                    95,
                    97,
                    117,
                    116,
                    104
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "user_lp_ata",
            "docs": [
              "The user's LP ATA where we will mint LP tokens."
            ],
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "user_transfer_authority"
                },
                {
                  "kind": "account",
                  "path": "lp_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_lp_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "vault_lp_mint_auth",
            "docs": [
              "The PDA authority used to sign mint instructions for LP tokens."
            ],
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    108,
                    112,
                    95,
                    109,
                    105,
                    110,
                    116,
                    95,
                    97,
                    117,
                    116,
                    104
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "asset_token_program"
          },
          {
            "name": "lp_token_program",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "system_program",
            "address": "11111111111111111111111111111111"
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
        "name": "direct_withdraw_strategy",
        "discriminator": [
          119,
          33,
          54,
          52,
          194,
          8,
          211,
          239
        ],
        "accounts": [
          {
            "name": "user_transfer_authority",
            "docs": [
              "The authority that owns the LP tokens and wants to redeem them"
            ],
            "writable": true,
            "signer": true
          },
          {
            "name": "protocol",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    116,
                    111,
                    99,
                    111,
                    108
                  ]
                }
              ]
            }
          },
          {
            "name": "vault",
            "writable": true
          },
          {
            "name": "adaptor_add_receipt",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    97,
                    100,
                    97,
                    112,
                    116,
                    111,
                    114,
                    95,
                    97,
                    100,
                    100,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "adaptor_program"
                }
              ]
            }
          },
          {
            "name": "strategy_init_receipt",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    114,
                    97,
                    116,
                    101,
                    103,
                    121,
                    95,
                    105,
                    110,
                    105,
                    116,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "strategy"
                }
              ]
            }
          },
          {
            "name": "direct_withdraw_init_receipt",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    100,
                    105,
                    114,
                    101,
                    99,
                    116,
                    95,
                    119,
                    105,
                    116,
                    104,
                    100,
                    114,
                    97,
                    119,
                    95,
                    105,
                    110,
                    105,
                    116,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "strategy"
                }
              ]
            }
          },
          {
            "name": "strategy"
          },
          {
            "name": "vault_asset_mint",
            "writable": true
          },
          {
            "name": "vault_lp_mint",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    108,
                    112,
                    95,
                    109,
                    105,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "request_withdraw_lp_ata",
            "docs": [
              "The request's LP token account from which LP tokens will be burned."
            ],
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "request_withdraw_vault_receipt"
                },
                {
                  "kind": "account",
                  "path": "lp_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_lp_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "vault_strategy_auth",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    115,
                    116,
                    114,
                    97,
                    116,
                    101,
                    103,
                    121,
                    95,
                    97,
                    117,
                    116,
                    104
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "strategy"
                }
              ]
            }
          },
          {
            "name": "user_asset_ata",
            "docs": [
              "The user's asset ATA to which asset tokens will be sent."
            ],
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "user_transfer_authority"
                },
                {
                  "kind": "account",
                  "path": "asset_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_asset_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "vault_strategy_asset_ata",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "vault_strategy_auth"
                },
                {
                  "kind": "account",
                  "path": "asset_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_asset_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "request_withdraw_vault_receipt",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    114,
                    101,
                    113,
                    117,
                    101,
                    115,
                    116,
                    95,
                    119,
                    105,
                    116,
                    104,
                    100,
                    114,
                    97,
                    119,
                    95,
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "user_transfer_authority"
                }
              ]
            }
          },
          {
            "name": "adaptor_program"
          },
          {
            "name": "asset_token_program"
          },
          {
            "name": "lp_token_program",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "system_program",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "user_args",
            "type": {
              "option": "bytes"
            }
          }
        ]
      },
      {
        "name": "harvest_fee",
        "discriminator": [
          32,
          59,
          42,
          128,
          246,
          73,
          255,
          47
        ],
        "accounts": [
          {
            "name": "harvester",
            "signer": true
          },
          {
            "name": "vault_manager"
          },
          {
            "name": "vault_admin"
          },
          {
            "name": "protocol_admin"
          },
          {
            "name": "protocol",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    116,
                    111,
                    99,
                    111,
                    108
                  ]
                }
              ]
            }
          },
          {
            "name": "vault",
            "writable": true
          },
          {
            "name": "vault_lp_mint",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    108,
                    112,
                    95,
                    109,
                    105,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "vault_lp_mint_auth",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    108,
                    112,
                    95,
                    109,
                    105,
                    110,
                    116,
                    95,
                    97,
                    117,
                    116,
                    104
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "vault_manager_lp_ata",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "vault_manager"
                },
                {
                  "kind": "account",
                  "path": "lp_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_lp_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "vault_admin_lp_ata",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "vault_admin"
                },
                {
                  "kind": "account",
                  "path": "lp_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_lp_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "protocol_admin_lp_ata",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "protocol_admin"
                },
                {
                  "kind": "account",
                  "path": "lp_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_lp_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "lp_token_program",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          }
        ],
        "args": []
      },
      {
        "name": "init_or_update_protocol",
        "discriminator": [
          149,
          56,
          57,
          46,
          105,
          182,
          61,
          208
        ],
        "accounts": [
          {
            "name": "payer",
            "writable": true,
            "signer": true
          },
          {
            "name": "current_admin",
            "signer": true
          },
          {
            "name": "new_admin"
          },
          {
            "name": "protocol",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    116,
                    111,
                    99,
                    111,
                    108
                  ]
                }
              ]
            }
          },
          {
            "name": "system_program",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "operational_state",
            "type": "u16"
          },
          {
            "name": "fee",
            "type": "u16"
          }
        ]
      },
      {
        "name": "initialize_direct_withdraw_strategy",
        "discriminator": [
          248,
          207,
          228,
          15,
          13,
          191,
          43,
          58
        ],
        "accounts": [
          {
            "name": "payer",
            "writable": true,
            "signer": true
          },
          {
            "name": "admin",
            "signer": true,
            "relations": [
              "vault"
            ]
          },
          {
            "name": "protocol",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    116,
                    111,
                    99,
                    111,
                    108
                  ]
                }
              ]
            }
          },
          {
            "name": "vault",
            "writable": true
          },
          {
            "name": "strategy"
          },
          {
            "name": "strategy_init_receipt",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    114,
                    97,
                    116,
                    101,
                    103,
                    121,
                    95,
                    105,
                    110,
                    105,
                    116,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "strategy"
                }
              ]
            }
          },
          {
            "name": "adaptor_add_receipt",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    97,
                    100,
                    97,
                    112,
                    116,
                    111,
                    114,
                    95,
                    97,
                    100,
                    100,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "adaptor_program"
                }
              ]
            }
          },
          {
            "name": "direct_withdraw_init_receipt",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    100,
                    105,
                    114,
                    101,
                    99,
                    116,
                    95,
                    119,
                    105,
                    116,
                    104,
                    100,
                    114,
                    97,
                    119,
                    95,
                    105,
                    110,
                    105,
                    116,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "strategy"
                }
              ]
            }
          },
          {
            "name": "adaptor_program"
          },
          {
            "name": "system_program",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "instruction_discriminator",
            "type": {
              "option": "bytes"
            }
          },
          {
            "name": "additional_args",
            "type": {
              "option": "bytes"
            }
          },
          {
            "name": "allow_user_args",
            "type": "bool"
          }
        ]
      },
      {
        "name": "initialize_strategy",
        "discriminator": [
          208,
          119,
          144,
          145,
          178,
          57,
          105,
          252
        ],
        "accounts": [
          {
            "name": "payer",
            "writable": true,
            "signer": true
          },
          {
            "name": "manager",
            "signer": true
          },
          {
            "name": "protocol",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    116,
                    111,
                    99,
                    111,
                    108
                  ]
                }
              ]
            }
          },
          {
            "name": "vault"
          },
          {
            "name": "strategy"
          },
          {
            "name": "adaptor_add_receipt",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    97,
                    100,
                    97,
                    112,
                    116,
                    111,
                    114,
                    95,
                    97,
                    100,
                    100,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "adaptor_program"
                }
              ]
            }
          },
          {
            "name": "strategy_init_receipt",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    114,
                    97,
                    116,
                    101,
                    103,
                    121,
                    95,
                    105,
                    110,
                    105,
                    116,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "strategy"
                }
              ]
            }
          },
          {
            "name": "vault_strategy_auth",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    115,
                    116,
                    114,
                    97,
                    116,
                    101,
                    103,
                    121,
                    95,
                    97,
                    117,
                    116,
                    104
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "strategy"
                }
              ]
            }
          },
          {
            "name": "adaptor_program"
          },
          {
            "name": "system_program",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "instruction_discriminator",
            "type": {
              "option": "bytes"
            }
          },
          {
            "name": "additional_args",
            "type": {
              "option": "bytes"
            }
          }
        ]
      },
      {
        "name": "initialize_vault",
        "discriminator": [
          48,
          191,
          163,
          44,
          71,
          129,
          63,
          164
        ],
        "accounts": [
          {
            "name": "payer",
            "writable": true,
            "signer": true
          },
          {
            "name": "manager"
          },
          {
            "name": "admin"
          },
          {
            "name": "protocol",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    116,
                    111,
                    99,
                    111,
                    108
                  ]
                }
              ]
            }
          },
          {
            "name": "vault",
            "writable": true,
            "signer": true
          },
          {
            "name": "vault_lp_mint",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    108,
                    112,
                    95,
                    109,
                    105,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "vault_asset_mint"
          },
          {
            "name": "vault_asset_idle_ata",
            "writable": true
          },
          {
            "name": "vault_lp_mint_auth",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    108,
                    112,
                    95,
                    109,
                    105,
                    110,
                    116,
                    95,
                    97,
                    117,
                    116,
                    104
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "vault_asset_idle_auth",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    97,
                    115,
                    115,
                    101,
                    116,
                    95,
                    105,
                    100,
                    108,
                    101,
                    95,
                    97,
                    117,
                    116,
                    104
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "clock",
            "address": "SysvarC1ock11111111111111111111111111111111"
          },
          {
            "name": "rent",
            "address": "SysvarRent111111111111111111111111111111111"
          },
          {
            "name": "associated_token_program",
            "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          },
          {
            "name": "asset_token_program"
          },
          {
            "name": "lp_token_program",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "system_program",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "config",
            "type": {
              "defined": {
                "name": "VaultInitializationInput"
              }
            }
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          }
        ]
      },
      {
        "name": "remove_adaptor",
        "discriminator": [
          161,
          199,
          99,
          22,
          25,
          193,
          61,
          193
        ],
        "accounts": [
          {
            "name": "admin",
            "writable": true,
            "signer": true,
            "relations": [
              "vault"
            ]
          },
          {
            "name": "protocol",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    116,
                    111,
                    99,
                    111,
                    108
                  ]
                }
              ]
            }
          },
          {
            "name": "vault",
            "writable": true
          },
          {
            "name": "adaptor_add_receipt",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    97,
                    100,
                    97,
                    112,
                    116,
                    111,
                    114,
                    95,
                    97,
                    100,
                    100,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "adaptor_program"
                }
              ]
            }
          },
          {
            "name": "adaptor_program"
          },
          {
            "name": "system_program",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "request_withdraw_vault",
        "discriminator": [
          248,
          225,
          47,
          22,
          116,
          144,
          23,
          143
        ],
        "accounts": [
          {
            "name": "payer",
            "docs": [
              "The payer of the request"
            ],
            "writable": true,
            "signer": true
          },
          {
            "name": "user_transfer_authority",
            "docs": [
              "The authority that owns the LP tokens and wants to redeem them"
            ],
            "signer": true
          },
          {
            "name": "protocol",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    116,
                    111,
                    99,
                    111,
                    108
                  ]
                }
              ]
            }
          },
          {
            "name": "vault"
          },
          {
            "name": "vault_lp_mint",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    108,
                    112,
                    95,
                    109,
                    105,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "user_lp_ata",
            "docs": [
              "The user's LP token account from which LP tokens will be burned."
            ],
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "user_transfer_authority"
                },
                {
                  "kind": "account",
                  "path": "lp_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_lp_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "request_withdraw_lp_ata",
            "docs": [
              "The request's associated token account for LP."
            ],
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "request_withdraw_vault_receipt"
                },
                {
                  "kind": "account",
                  "path": "lp_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_lp_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "request_withdraw_vault_receipt",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    114,
                    101,
                    113,
                    117,
                    101,
                    115,
                    116,
                    95,
                    119,
                    105,
                    116,
                    104,
                    100,
                    114,
                    97,
                    119,
                    95,
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "user_transfer_authority"
                }
              ]
            }
          },
          {
            "name": "lp_token_program",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "system_program",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "is_amount_in_lp",
            "type": "bool"
          },
          {
            "name": "is_withdraw_all",
            "type": "bool"
          }
        ]
      },
      {
        "name": "update_vault",
        "discriminator": [
          67,
          229,
          185,
          188,
          226,
          11,
          210,
          60
        ],
        "accounts": [
          {
            "name": "admin",
            "signer": true,
            "relations": [
              "vault"
            ]
          },
          {
            "name": "protocol",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    116,
                    111,
                    99,
                    111,
                    108
                  ]
                }
              ]
            }
          },
          {
            "name": "vault",
            "writable": true
          },
          {
            "name": "rent",
            "address": "SysvarRent111111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "config",
            "type": {
              "defined": {
                "name": "VaultInitializationInput"
              }
            }
          }
        ]
      },
      {
        "name": "withdraw_strategy",
        "discriminator": [
          31,
          45,
          162,
          5,
          193,
          217,
          134,
          188
        ],
        "accounts": [
          {
            "name": "manager",
            "signer": true
          },
          {
            "name": "protocol",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    116,
                    111,
                    99,
                    111,
                    108
                  ]
                }
              ]
            }
          },
          {
            "name": "vault",
            "writable": true
          },
          {
            "name": "adaptor_add_receipt",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    97,
                    100,
                    97,
                    112,
                    116,
                    111,
                    114,
                    95,
                    97,
                    100,
                    100,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "adaptor_program"
                }
              ]
            }
          },
          {
            "name": "strategy_init_receipt",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    114,
                    97,
                    116,
                    101,
                    103,
                    121,
                    95,
                    105,
                    110,
                    105,
                    116,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "strategy"
                }
              ]
            }
          },
          {
            "name": "strategy"
          },
          {
            "name": "adaptor_program"
          },
          {
            "name": "vault_asset_idle_auth",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    97,
                    115,
                    115,
                    101,
                    116,
                    95,
                    105,
                    100,
                    108,
                    101,
                    95,
                    97,
                    117,
                    116,
                    104
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "vault_strategy_auth",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    115,
                    116,
                    114,
                    97,
                    116,
                    101,
                    103,
                    121,
                    95,
                    97,
                    117,
                    116,
                    104
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "strategy"
                }
              ]
            }
          },
          {
            "name": "vault_asset_mint",
            "writable": true
          },
          {
            "name": "vault_lp_mint",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    108,
                    112,
                    95,
                    109,
                    105,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "vault_asset_idle_ata",
            "docs": [
              "The vault's associated token account for asset."
            ],
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "vault_asset_idle_auth"
                },
                {
                  "kind": "account",
                  "path": "asset_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_asset_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "vault_strategy_asset_ata",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "vault_strategy_auth"
                },
                {
                  "kind": "account",
                  "path": "asset_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_asset_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "asset_token_program"
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "instruction_discriminator",
            "type": {
              "option": "bytes"
            }
          },
          {
            "name": "additional_args",
            "type": {
              "option": "bytes"
            }
          }
        ]
      },
      {
        "name": "withdraw_vault",
        "discriminator": [
          135,
          7,
          237,
          120,
          149,
          94,
          95,
          7
        ],
        "accounts": [
          {
            "name": "user_transfer_authority",
            "docs": [
              "The authority that owns the LP tokens and wants to redeem them"
            ],
            "writable": true,
            "signer": true
          },
          {
            "name": "protocol",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    116,
                    111,
                    99,
                    111,
                    108
                  ]
                }
              ]
            }
          },
          {
            "name": "vault",
            "writable": true
          },
          {
            "name": "vault_asset_mint"
          },
          {
            "name": "vault_lp_mint",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    108,
                    112,
                    95,
                    109,
                    105,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "request_withdraw_lp_ata",
            "docs": [
              "The request's LP token account from which LP tokens will be burned."
            ],
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "request_withdraw_vault_receipt"
                },
                {
                  "kind": "account",
                  "path": "lp_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_lp_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "vault_asset_idle_ata",
            "docs": [
              "The vault's associated token account for asset."
            ],
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "vault_asset_idle_auth"
                },
                {
                  "kind": "account",
                  "path": "asset_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_asset_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "vault_asset_idle_auth",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    97,
                    115,
                    115,
                    101,
                    116,
                    95,
                    105,
                    100,
                    108,
                    101,
                    95,
                    97,
                    117,
                    116,
                    104
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                }
              ]
            }
          },
          {
            "name": "user_asset_ata",
            "docs": [
              "The user's asset ATA to which asset tokens will be sent."
            ],
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "user_transfer_authority"
                },
                {
                  "kind": "account",
                  "path": "asset_token_program"
                },
                {
                  "kind": "account",
                  "path": "vault_asset_mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "request_withdraw_vault_receipt",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    114,
                    101,
                    113,
                    117,
                    101,
                    115,
                    116,
                    95,
                    119,
                    105,
                    116,
                    104,
                    100,
                    114,
                    97,
                    119,
                    95,
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    114,
                    101,
                    99,
                    101,
                    105,
                    112,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "account",
                  "path": "user_transfer_authority"
                }
              ]
            }
          },
          {
            "name": "asset_token_program"
          },
          {
            "name": "lp_token_program",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "system_program",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      }
    ],
    "accounts": [
      {
        "name": "AdaptorAddReceipt",
        "discriminator": [
          105,
          99,
          219,
          155,
          77,
          241,
          7,
          119
        ]
      },
      {
        "name": "DirectWithdrawInitReceipt",
        "discriminator": [
          206,
          77,
          207,
          208,
          25,
          244,
          81,
          172
        ]
      },
      {
        "name": "Protocol",
        "discriminator": [
          45,
          39,
          101,
          43,
          115,
          72,
          131,
          40
        ]
      },
      {
        "name": "RequestWithdrawVaultReceipt",
        "discriminator": [
          203,
          81,
          223,
          141,
          175,
          108,
          101,
          114
        ]
      },
      {
        "name": "StrategyInitReceipt",
        "discriminator": [
          51,
          8,
          192,
          253,
          115,
          78,
          112,
          214
        ]
      },
      {
        "name": "Vault",
        "discriminator": [
          211,
          8,
          232,
          43,
          2,
          152,
          117,
          119
        ]
      }
    ],
    "events": [
      {
        "name": "AddAdaptorEvent",
        "discriminator": [
          24,
          181,
          201,
          148,
          240,
          183,
          235,
          12
        ]
      },
      {
        "name": "CancelRequestWithdrawVaultEvent",
        "discriminator": [
          46,
          165,
          24,
          114,
          1,
          80,
          205,
          136
        ]
      },
      {
        "name": "CloseStrategyEvent",
        "discriminator": [
          213,
          95,
          219,
          161,
          17,
          208,
          93,
          255
        ]
      },
      {
        "name": "DepositStrategyEvent",
        "discriminator": [
          202,
          201,
          118,
          49,
          29,
          180,
          116,
          170
        ]
      },
      {
        "name": "DepositVaultEvent",
        "discriminator": [
          11,
          15,
          7,
          92,
          150,
          100,
          165,
          232
        ]
      },
      {
        "name": "DirectWithdrawStrategyEvent",
        "discriminator": [
          113,
          202,
          151,
          124,
          137,
          255,
          153,
          101
        ]
      },
      {
        "name": "HarvestFeeEvent",
        "discriminator": [
          69,
          48,
          192,
          23,
          232,
          22,
          23,
          30
        ]
      },
      {
        "name": "InitProtocolEvent",
        "discriminator": [
          13,
          81,
          183,
          132,
          88,
          43,
          202,
          213
        ]
      },
      {
        "name": "InitializeDirectWithdrawStrategyEvent",
        "discriminator": [
          169,
          22,
          57,
          8,
          15,
          73,
          255,
          115
        ]
      },
      {
        "name": "InitializeStrategyEvent",
        "discriminator": [
          30,
          233,
          211,
          249,
          83,
          188,
          234,
          152
        ]
      },
      {
        "name": "InitializeVaultEvent",
        "discriminator": [
          179,
          75,
          50,
          161,
          191,
          28,
          245,
          107
        ]
      },
      {
        "name": "RemoveAdaptorEvent",
        "discriminator": [
          155,
          178,
          2,
          29,
          245,
          86,
          246,
          153
        ]
      },
      {
        "name": "RequestWithdrawVaultEvent",
        "discriminator": [
          59,
          94,
          26,
          38,
          47,
          131,
          158,
          162
        ]
      },
      {
        "name": "UpdateProtocolEvent",
        "discriminator": [
          14,
          227,
          204,
          217,
          62,
          46,
          241,
          237
        ]
      },
      {
        "name": "UpdateVaultEvent",
        "discriminator": [
          123,
          31,
          27,
          189,
          102,
          1,
          121,
          57
        ]
      },
      {
        "name": "WithdrawStrategyEvent",
        "discriminator": [
          112,
          45,
          16,
          172,
          170,
          33,
          22,
          212
        ]
      },
      {
        "name": "WithdrawVaultEvent",
        "discriminator": [
          196,
          123,
          79,
          215,
          4,
          214,
          20,
          197
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "InvalidAmount",
        "msg": "Invalid amount provided."
      },
      {
        "code": 6001,
        "name": "InvalidTokenMint",
        "msg": "Invalid token mint."
      },
      {
        "code": 6002,
        "name": "InvalidTokenAccount",
        "msg": "Invalid token account."
      },
      {
        "code": 6003,
        "name": "InvalidAccountInput",
        "msg": "Invalid account input."
      },
      {
        "code": 6004,
        "name": "MathOverflow",
        "msg": "Math overflow."
      },
      {
        "code": 6005,
        "name": "FeeExceedsTotalAssetValue",
        "msg": "Fee exceeds total asset value."
      },
      {
        "code": 6006,
        "name": "MaxCapExceeded",
        "msg": "Max cap exceeded."
      },
      {
        "code": 6007,
        "name": "VaultNotActive",
        "msg": "Vault not active."
      },
      {
        "code": 6008,
        "name": "ManagerNotAllowed",
        "msg": "Manager not allowed in remaining."
      },
      {
        "code": 6009,
        "name": "OperationNotAllowed",
        "msg": "Operation not allowed."
      },
      {
        "code": 6010,
        "name": "AdaptorEpochInvalid",
        "msg": "Adaptor epoch invalid."
      },
      {
        "code": 6011,
        "name": "InvalidFeeConfiguration",
        "msg": "Fee configuration invalid."
      },
      {
        "code": 6012,
        "name": "WithdrawalNotYetAvailable",
        "msg": "Withdrawal not yet available."
      },
      {
        "code": 6013,
        "name": "InvalidInput",
        "msg": "Invalid input."
      }
    ],
    "types": [
      {
        "name": "AdaptorAddReceipt",
        "serialization": "bytemuckunsafe",
        "repr": {
          "kind": "c"
        },
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "docs": [
                "The vault associated with this strategy."
              ],
              "type": "pubkey"
            },
            {
              "name": "adaptor_program",
              "docs": [
                "The adapter program address."
              ],
              "type": "pubkey"
            },
            {
              "name": "version",
              "docs": [
                "A version number (1 byte)."
              ],
              "type": "u8"
            },
            {
              "name": "bump",
              "docs": [
                "The bump for the adaptor add receipt."
              ],
              "type": "u8"
            },
            {
              "name": "_padding0",
              "docs": [
                "7 bytes of padding to align future 8-byte fields on 8-byte boundaries."
              ],
              "type": {
                "array": [
                  "u8",
                  7
                ]
              }
            },
            {
              "name": "last_updated_epoch",
              "docs": [
                "The epoch at which the strategy was last updated."
              ],
              "type": "u64"
            },
            {
              "name": "_reserved",
              "docs": [
                "Reserved space for future fields"
              ],
              "type": {
                "array": [
                  "u8",
                  56
                ]
              }
            }
          ]
        }
      },
      {
        "name": "AddAdaptorEvent",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "adaptor_program",
              "type": "pubkey"
            },
            {
              "name": "adaptor_add_receipt",
              "type": "pubkey"
            }
          ]
        }
      },
      {
        "name": "CancelRequestWithdrawVaultEvent",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "user",
              "type": "pubkey"
            },
            {
              "name": "request_withdraw_vault_receipt",
              "type": "pubkey"
            },
            {
              "name": "amount_lp_refunded",
              "type": "u64"
            },
            {
              "name": "amount_lp_burned",
              "type": "u64"
            },
            {
              "name": "vault_highest_asset_per_lp_decimal_bits_before",
              "type": "u128"
            },
            {
              "name": "vault_highest_asset_per_lp_decimal_bits_after",
              "type": "u128"
            }
          ]
        }
      },
      {
        "name": "CloseStrategyEvent",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "strategy",
              "type": "pubkey"
            },
            {
              "name": "strategy_init_receipt",
              "type": "pubkey"
            }
          ]
        }
      },
      {
        "name": "DepositStrategyEvent",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "strategy",
              "type": "pubkey"
            },
            {
              "name": "strategy_init_receipt",
              "type": "pubkey"
            },
            {
              "name": "adaptor_program",
              "type": "pubkey"
            },
            {
              "name": "vault_asset_total_value_before",
              "type": "u64"
            },
            {
              "name": "vault_asset_total_value_after",
              "type": "u64"
            },
            {
              "name": "vault_lp_supply_incl_fees_before",
              "type": "u64"
            },
            {
              "name": "vault_lp_supply_incl_fees_after",
              "type": "u64"
            },
            {
              "name": "vault_highest_asset_per_lp_decimal_bits_before",
              "type": "u128"
            },
            {
              "name": "vault_highest_asset_per_lp_decimal_bits_after",
              "type": "u128"
            },
            {
              "name": "vault_asset_idle_ata_amount_before",
              "type": "u64"
            },
            {
              "name": "vault_asset_idle_ata_amount_after",
              "type": "u64"
            },
            {
              "name": "strategy_position_value_before",
              "type": "u64"
            },
            {
              "name": "strategy_position_value_after",
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "DepositVaultEvent",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "user",
              "type": "pubkey"
            },
            {
              "name": "vault_asset_total_value_before",
              "type": "u64"
            },
            {
              "name": "vault_asset_total_value_after",
              "type": "u64"
            },
            {
              "name": "vault_lp_supply_incl_fees_before",
              "type": "u64"
            },
            {
              "name": "vault_lp_supply_incl_fees_after",
              "type": "u64"
            },
            {
              "name": "vault_highest_asset_per_lp_decimal_bits_before",
              "type": "u128"
            },
            {
              "name": "vault_highest_asset_per_lp_decimal_bits_after",
              "type": "u128"
            },
            {
              "name": "vault_last_updated_ts",
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "DirectWithdrawInitReceipt",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "docs": [
                "The vault associated with this strategy."
              ],
              "type": "pubkey"
            },
            {
              "name": "strategy",
              "docs": [
                "The strategy address."
              ],
              "type": "pubkey"
            },
            {
              "name": "adaptor_program",
              "docs": [
                "The position value."
              ],
              "type": "pubkey"
            },
            {
              "name": "instruction_discriminator",
              "docs": [
                "The instruction discriminator."
              ],
              "type": "bytes"
            },
            {
              "name": "additional_args",
              "docs": [
                "The additional arguments."
              ],
              "type": {
                "option": "bytes"
              }
            },
            {
              "name": "allow_user_args",
              "docs": [
                "Whether the user args are allowed."
              ],
              "type": "bool"
            },
            {
              "name": "version",
              "docs": [
                "A version number (1 byte)."
              ],
              "type": "u8"
            },
            {
              "name": "bump",
              "docs": [
                "The bump for the strategy init receipt."
              ],
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "DirectWithdrawStrategyEvent",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "strategy",
              "type": "pubkey"
            },
            {
              "name": "strategy_init_receipt",
              "type": "pubkey"
            },
            {
              "name": "direct_withdraw_init_receipt",
              "type": "pubkey"
            },
            {
              "name": "adaptor_program",
              "type": "pubkey"
            },
            {
              "name": "vault_asset_total_value_before",
              "type": "u64"
            },
            {
              "name": "vault_asset_total_value_after",
              "type": "u64"
            },
            {
              "name": "vault_lp_supply_incl_fees_before",
              "type": "u64"
            },
            {
              "name": "vault_lp_supply_incl_fees_after",
              "type": "u64"
            },
            {
              "name": "vault_highest_asset_per_lp_decimal_bits_before",
              "type": "u128"
            },
            {
              "name": "vault_highest_asset_per_lp_decimal_bits_after",
              "type": "u128"
            },
            {
              "name": "strategy_position_value_before",
              "type": "u64"
            },
            {
              "name": "strategy_position_value_after",
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "FeeConfiguration",
        "serialization": "bytemuckunsafe",
        "repr": {
          "kind": "c"
        },
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "manager_performance_fee",
              "docs": [
                "Manager performance fee in basis points (BPS)."
              ],
              "type": "u16"
            },
            {
              "name": "admin_performance_fee",
              "docs": [
                "Admin performance fee in basis points (BPS)."
              ],
              "type": "u16"
            },
            {
              "name": "manager_management_fee",
              "docs": [
                "Manager management fee in basis points (BPS)."
              ],
              "type": "u16"
            },
            {
              "name": "admin_management_fee",
              "docs": [
                "Admin management fee in basis points (BPS)."
              ],
              "type": "u16"
            },
            {
              "name": "redemption_fee",
              "docs": [
                "The redemption fee in basis points (BPS)."
              ],
              "type": "u16"
            },
            {
              "name": "issuance_fee",
              "docs": [
                "The issuance fee in basis points (BPS)."
              ],
              "type": "u16"
            },
            {
              "name": "reserved",
              "docs": [
                "Reserved bytes for future use."
              ],
              "type": {
                "array": [
                  "u8",
                  36
                ]
              }
            }
          ]
        }
      },
      {
        "name": "FeeState",
        "serialization": "bytemuckunsafe",
        "repr": {
          "kind": "c"
        },
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "accumulated_lp_manager_fees",
              "docs": [
                "The accumulated manager fees in the vault."
              ],
              "type": "u64"
            },
            {
              "name": "accumulated_lp_admin_fees",
              "docs": [
                "The accumulated admin fees in the vault."
              ],
              "type": "u64"
            },
            {
              "name": "accumulated_lp_protocol_fees",
              "docs": [
                "The accumulated protocol fees in the vault."
              ],
              "type": "u64"
            },
            {
              "name": "reserved",
              "docs": [
                "Reserved bytes for future use."
              ],
              "type": {
                "array": [
                  "u8",
                  24
                ]
              }
            }
          ]
        }
      },
      {
        "name": "FeeUpdate",
        "serialization": "bytemuckunsafe",
        "repr": {
          "kind": "c"
        },
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "last_performance_fee_update_ts",
              "docs": [
                "The timestamp when the performance fees were last updated."
              ],
              "type": "u64"
            },
            {
              "name": "last_management_fee_update_ts",
              "docs": [
                "The timestamp when the management fees were last updated."
              ],
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "HarvestFeeEvent",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "protocol",
              "type": "pubkey"
            },
            {
              "name": "admin",
              "type": "pubkey"
            },
            {
              "name": "manager",
              "type": "pubkey"
            },
            {
              "name": "amount_lp_admin_fees",
              "type": "u64"
            },
            {
              "name": "amount_lp_manager_fees",
              "type": "u64"
            },
            {
              "name": "amount_lp_protocol_fees",
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "HighWaterMark",
        "serialization": "bytemuckunsafe",
        "repr": {
          "kind": "c"
        },
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "highest_asset_per_lp_decimal_bits",
              "docs": [
                "The highest recorded total asset value per share"
              ],
              "type": "u128"
            },
            {
              "name": "last_updated_ts",
              "docs": [
                "The timestamp when the high water mark was last updated"
              ],
              "type": "u64"
            },
            {
              "name": "reserved",
              "docs": [
                "Reserved for future use"
              ],
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
        "name": "InitProtocolEvent",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "admin",
              "type": "pubkey"
            },
            {
              "name": "operational_state",
              "type": "u16"
            },
            {
              "name": "fee",
              "type": "u16"
            }
          ]
        }
      },
      {
        "name": "InitializeDirectWithdrawStrategyEvent",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "strategy",
              "type": "pubkey"
            },
            {
              "name": "strategy_init_receipt",
              "type": "pubkey"
            },
            {
              "name": "adaptor_program",
              "type": "pubkey"
            },
            {
              "name": "instruction_discriminator",
              "type": "bytes"
            },
            {
              "name": "additional_args",
              "type": "bytes"
            },
            {
              "name": "allow_user_args",
              "type": "bool"
            }
          ]
        }
      },
      {
        "name": "InitializeStrategyEvent",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "strategy",
              "type": "pubkey"
            },
            {
              "name": "strategy_init_receipt",
              "type": "pubkey"
            },
            {
              "name": "adaptor_program",
              "type": "pubkey"
            }
          ]
        }
      },
      {
        "name": "InitializeVaultEvent",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "vault_name",
              "type": "string"
            },
            {
              "name": "vault_description",
              "type": "string"
            },
            {
              "name": "vault_asset_mint",
              "type": "pubkey"
            },
            {
              "name": "vault_asset_idle_ata",
              "type": "pubkey"
            },
            {
              "name": "vault_lp_mint",
              "type": "pubkey"
            },
            {
              "name": "vault_manager",
              "type": "pubkey"
            },
            {
              "name": "vault_admin",
              "type": "pubkey"
            },
            {
              "name": "vault_config_max_cap",
              "type": "u64"
            },
            {
              "name": "vault_config_start_at_ts",
              "type": "u64"
            },
            {
              "name": "vault_config_locked_profit_degradation_duration",
              "type": "u64"
            },
            {
              "name": "vault_config_withdrawal_waiting_period",
              "type": "u64"
            },
            {
              "name": "vault_config_manager_performance_fee",
              "type": "u16"
            },
            {
              "name": "vault_config_admin_performance_fee",
              "type": "u16"
            },
            {
              "name": "vault_config_manager_management_fee",
              "type": "u16"
            },
            {
              "name": "vault_config_admin_management_fee",
              "type": "u16"
            },
            {
              "name": "vault_config_redemption_fee",
              "type": "u16"
            },
            {
              "name": "vault_config_issuance_fee",
              "type": "u16"
            },
            {
              "name": "vault_last_updated_ts",
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "LockedProfitState",
        "serialization": "bytemuckunsafe",
        "repr": {
          "kind": "c"
        },
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "last_updated_locked_profit",
              "type": "u64"
            },
            {
              "name": "last_report",
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "Protocol",
        "serialization": "bytemuckunsafe",
        "repr": {
          "kind": "c"
        },
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "admin",
              "docs": [
                "The admin of the protocol."
              ],
              "type": "pubkey"
            },
            {
              "name": "operational_state",
              "docs": [
                "The operational state of the protocol."
              ],
              "type": "u16"
            },
            {
              "name": "fee",
              "docs": [
                "The fee for the protocol."
              ],
              "type": "u16"
            },
            {
              "name": "bump",
              "docs": [
                "The bump for the protocol."
              ],
              "type": "u8"
            },
            {
              "name": "_padding0",
              "docs": [
                "1 byte of padding to align future 8-byte fields on 8-byte boundaries."
              ],
              "type": {
                "array": [
                  "u8",
                  1
                ]
              }
            },
            {
              "name": "_reserved",
              "docs": [
                "Reserved space for future fields"
              ],
              "type": {
                "array": [
                  "u8",
                  64
                ]
              }
            }
          ]
        }
      },
      {
        "name": "RemoveAdaptorEvent",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "adaptor_program",
              "type": "pubkey"
            },
            {
              "name": "adaptor_add_receipt",
              "type": "pubkey"
            }
          ]
        }
      },
      {
        "name": "RequestWithdrawVaultEvent",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "user",
              "type": "pubkey"
            },
            {
              "name": "request_withdraw_vault_receipt",
              "type": "pubkey"
            },
            {
              "name": "amount_lp_escrowed",
              "type": "u64"
            },
            {
              "name": "amount_asset_to_withdraw_decimal_bits",
              "type": "u128"
            },
            {
              "name": "withdrawable_from_ts",
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "RequestWithdrawVaultReceipt",
        "serialization": "bytemuckunsafe",
        "repr": {
          "kind": "c"
        },
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "user",
              "type": "pubkey"
            },
            {
              "name": "amount_lp_escrowed",
              "type": "u64"
            },
            {
              "name": "amount_asset_to_withdraw_decimal_bits",
              "type": "u128"
            },
            {
              "name": "withdrawable_from_ts",
              "type": "u64"
            },
            {
              "name": "bump",
              "type": "u8"
            },
            {
              "name": "version",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "StrategyInitReceipt",
        "serialization": "bytemuckunsafe",
        "repr": {
          "kind": "c"
        },
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "docs": [
                "The vault associated with this strategy."
              ],
              "type": "pubkey"
            },
            {
              "name": "strategy",
              "docs": [
                "The strategy address."
              ],
              "type": "pubkey"
            },
            {
              "name": "adaptor_program",
              "docs": [
                "The adaptor program address."
              ],
              "type": "pubkey"
            },
            {
              "name": "position_value",
              "docs": [
                "The position value."
              ],
              "type": "u64"
            },
            {
              "name": "last_updated_ts",
              "docs": [
                "The last updated timestamp."
              ],
              "type": "u64"
            },
            {
              "name": "version",
              "docs": [
                "A version number (1 byte)."
              ],
              "type": "u8"
            },
            {
              "name": "bump",
              "docs": [
                "The bump for the strategy init receipt."
              ],
              "type": "u8"
            },
            {
              "name": "vault_strategy_auth_bump",
              "docs": [
                "The bump for the vault strategy auth."
              ],
              "type": "u8"
            },
            {
              "name": "_padding0",
              "docs": [
                "6 bytes of padding to align future 8-byte fields on 8-byte boundaries."
              ],
              "type": {
                "array": [
                  "u8",
                  5
                ]
              }
            },
            {
              "name": "_reserved",
              "docs": [
                "Reserved space for future fields"
              ],
              "type": {
                "array": [
                  "u8",
                  64
                ]
              }
            }
          ]
        }
      },
      {
        "name": "UpdateProtocolEvent",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "protocol",
              "type": "pubkey"
            },
            {
              "name": "admin_before",
              "type": "pubkey"
            },
            {
              "name": "admin_after",
              "type": "pubkey"
            },
            {
              "name": "operational_state_before",
              "type": "u16"
            },
            {
              "name": "operational_state_after",
              "type": "u16"
            },
            {
              "name": "fee_before",
              "type": "u16"
            },
            {
              "name": "fee_after",
              "type": "u16"
            }
          ]
        }
      },
      {
        "name": "UpdateVaultEvent",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "vault_config_max_cap_before",
              "type": "u64"
            },
            {
              "name": "vault_config_max_cap_after",
              "type": "u64"
            },
            {
              "name": "vault_config_start_at_ts_before",
              "type": "u64"
            },
            {
              "name": "vault_config_start_at_ts_after",
              "type": "u64"
            },
            {
              "name": "vault_config_locked_profit_degradation_duration_before",
              "type": "u64"
            },
            {
              "name": "vault_config_locked_profit_degradation_duration_after",
              "type": "u64"
            },
            {
              "name": "vault_config_withdrawal_waiting_period_before",
              "type": "u64"
            },
            {
              "name": "vault_config_withdrawal_waiting_period_after",
              "type": "u64"
            },
            {
              "name": "vault_config_manager_performance_fee_before",
              "type": "u16"
            },
            {
              "name": "vault_config_manager_performance_fee_after",
              "type": "u16"
            },
            {
              "name": "vault_config_admin_performance_fee_before",
              "type": "u16"
            },
            {
              "name": "vault_config_admin_performance_fee_after",
              "type": "u16"
            },
            {
              "name": "vault_config_manager_management_fee_before",
              "type": "u16"
            },
            {
              "name": "vault_config_manager_management_fee_after",
              "type": "u16"
            },
            {
              "name": "vault_config_admin_management_fee_before",
              "type": "u16"
            },
            {
              "name": "vault_config_admin_management_fee_after",
              "type": "u16"
            },
            {
              "name": "vault_config_redemption_fee_before",
              "type": "u16"
            },
            {
              "name": "vault_config_redemption_fee_after",
              "type": "u16"
            },
            {
              "name": "vault_config_issuance_fee_before",
              "type": "u16"
            },
            {
              "name": "vault_config_issuance_fee_after",
              "type": "u16"
            },
            {
              "name": "vault_last_updated_ts",
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "Vault",
        "serialization": "bytemuckunsafe",
        "repr": {
          "kind": "c"
        },
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "name",
              "docs": [
                "The vault's name."
              ],
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            },
            {
              "name": "description",
              "docs": [
                "A description or summary for this vault."
              ],
              "type": {
                "array": [
                  "u8",
                  64
                ]
              }
            },
            {
              "name": "asset",
              "docs": [
                "The vault’s main asset configuration (inline nested struct)."
              ],
              "type": {
                "defined": {
                  "name": "VaultAsset"
                }
              }
            },
            {
              "name": "lp",
              "docs": [
                "The vault’s LP (share) configuration (inline nested struct)."
              ],
              "type": {
                "defined": {
                  "name": "VaultLp"
                }
              }
            },
            {
              "name": "manager",
              "docs": [
                "The manager of this vault (has certain permissions)."
              ],
              "type": "pubkey"
            },
            {
              "name": "admin",
              "docs": [
                "The admin of this vault (broader or fallback permissions)."
              ],
              "type": "pubkey"
            },
            {
              "name": "vault_configuration",
              "docs": [
                "The vault fee, cap, and locked profit degradation duration configuration (inline nested struct)."
              ],
              "type": {
                "defined": {
                  "name": "VaultConfiguration"
                }
              }
            },
            {
              "name": "fee_configuration",
              "docs": [
                "The vault fee and cap configuration (inline nested struct)."
              ],
              "type": {
                "defined": {
                  "name": "FeeConfiguration"
                }
              }
            },
            {
              "name": "fee_update",
              "docs": [
                "The fee update state of the vault."
              ],
              "type": {
                "defined": {
                  "name": "FeeUpdate"
                }
              }
            },
            {
              "name": "fee_state",
              "docs": [
                "The fee state of the vault."
              ],
              "type": {
                "defined": {
                  "name": "FeeState"
                }
              }
            },
            {
              "name": "high_water_mark",
              "type": {
                "defined": {
                  "name": "HighWaterMark"
                }
              }
            },
            {
              "name": "last_updated_ts",
              "docs": [
                "The last time (Unix timestamp) this vault data was updated."
              ],
              "type": "u64"
            },
            {
              "name": "version",
              "docs": [
                "The version of the vault."
              ],
              "type": "u8"
            },
            {
              "name": "_padding0",
              "docs": [
                "padding to align future 8-byte fields on 8-byte boundaries."
              ],
              "type": {
                "array": [
                  "u8",
                  7
                ]
              }
            },
            {
              "name": "locked_profit_state",
              "docs": [
                "The locked profit state of the vault."
              ],
              "type": {
                "defined": {
                  "name": "LockedProfitState"
                }
              }
            },
            {
              "name": "reserved",
              "docs": [
                "Reserved bytes for future use."
              ],
              "type": {
                "array": [
                  "u8",
                  240
                ]
              }
            }
          ]
        }
      },
      {
        "name": "VaultAsset",
        "serialization": "bytemuckunsafe",
        "repr": {
          "kind": "c"
        },
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "mint",
              "docs": [
                "The mint for the vault’s main asset."
              ],
              "type": "pubkey"
            },
            {
              "name": "idle_ata",
              "docs": [
                "The “idle” token account holding un-invested assets."
              ],
              "type": "pubkey"
            },
            {
              "name": "total_value",
              "docs": [
                "The total amount of this asset currently in the vault."
              ],
              "type": "u64"
            },
            {
              "name": "idle_ata_auth_bump",
              "docs": [
                "The bump for the vault asset mint."
              ],
              "type": "u8"
            },
            {
              "name": "reserved",
              "docs": [
                "Reserved bytes for future use."
              ],
              "type": {
                "array": [
                  "u8",
                  95
                ]
              }
            }
          ]
        }
      },
      {
        "name": "VaultConfiguration",
        "serialization": "bytemuckunsafe",
        "repr": {
          "kind": "c"
        },
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "max_cap",
              "docs": [
                "The maximum total amount allowed in the vault."
              ],
              "type": "u64"
            },
            {
              "name": "start_at_ts",
              "docs": [
                "active from timestamp"
              ],
              "type": "u64"
            },
            {
              "name": "locked_profit_degradation_duration",
              "docs": [
                "The locked profit degradation duration."
              ],
              "type": "u64"
            },
            {
              "name": "withdrawal_waiting_period",
              "docs": [
                "The waiting period for a withdrawal. prec: seconds"
              ],
              "type": "u64"
            },
            {
              "name": "reserved",
              "docs": [
                "Reserved bytes for future use."
              ],
              "type": {
                "array": [
                  "u8",
                  48
                ]
              }
            }
          ]
        }
      },
      {
        "name": "VaultInitializationInput",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "max_cap",
              "docs": [
                "The maximum total amount allowed in the vault."
              ],
              "type": "u64"
            },
            {
              "name": "start_at_ts",
              "docs": [
                "active from timestamp"
              ],
              "type": "u64"
            },
            {
              "name": "manager_performance_fee",
              "docs": [
                "Manager performance fee in basis points (BPS)."
              ],
              "type": "u16"
            },
            {
              "name": "admin_performance_fee",
              "docs": [
                "Admin performance fee in basis points (BPS)."
              ],
              "type": "u16"
            },
            {
              "name": "manager_management_fee",
              "docs": [
                "Manager management fee in basis points (BPS)."
              ],
              "type": "u16"
            },
            {
              "name": "admin_management_fee",
              "docs": [
                "Admin management fee in basis points (BPS)."
              ],
              "type": "u16"
            },
            {
              "name": "locked_profit_degradation_duration",
              "docs": [
                "The locked profit degradation duration."
              ],
              "type": "u64"
            },
            {
              "name": "redemption_fee",
              "docs": [
                "The redemption fee in basis points (BPS)."
              ],
              "type": "u16"
            },
            {
              "name": "issuance_fee",
              "docs": [
                "The issuance fee in basis points (BPS)."
              ],
              "type": "u16"
            },
            {
              "name": "withdrawal_waiting_period",
              "docs": [
                "The waiting period for a withdrawal."
              ],
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "VaultLp",
        "serialization": "bytemuckunsafe",
        "repr": {
          "kind": "c"
        },
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "mint",
              "docs": [
                "The LP mint (e.g., representing shares in this vault)."
              ],
              "type": "pubkey"
            },
            {
              "name": "mint_bump",
              "docs": [
                "The bump for the vault LP mint."
              ],
              "type": "u8"
            },
            {
              "name": "mint_auth_bump",
              "docs": [
                "The bump for the vault LP mint authority."
              ],
              "type": "u8"
            },
            {
              "name": "reserved",
              "docs": [
                "Reserved bytes for future use."
              ],
              "type": {
                "array": [
                  "u8",
                  62
                ]
              }
            }
          ]
        }
      },
      {
        "name": "WithdrawStrategyEvent",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "strategy",
              "type": "pubkey"
            },
            {
              "name": "strategy_init_receipt",
              "type": "pubkey"
            },
            {
              "name": "adaptor_program",
              "type": "pubkey"
            },
            {
              "name": "vault_asset_total_value_before",
              "type": "u64"
            },
            {
              "name": "vault_asset_total_value_after",
              "type": "u64"
            },
            {
              "name": "vault_lp_supply_incl_fees_before",
              "type": "u64"
            },
            {
              "name": "vault_lp_supply_incl_fees_after",
              "type": "u64"
            },
            {
              "name": "vault_highest_asset_per_lp_decimal_bits_before",
              "type": "u128"
            },
            {
              "name": "vault_highest_asset_per_lp_decimal_bits_after",
              "type": "u128"
            },
            {
              "name": "vault_asset_idle_ata_amount_before",
              "type": "u64"
            },
            {
              "name": "vault_asset_idle_ata_amount_after",
              "type": "u64"
            },
            {
              "name": "strategy_position_value_before",
              "type": "u64"
            },
            {
              "name": "strategy_position_value_after",
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "WithdrawVaultEvent",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "user",
              "type": "pubkey"
            },
            {
              "name": "vault_asset_total_value_before",
              "type": "u64"
            },
            {
              "name": "vault_asset_total_value_after",
              "type": "u64"
            },
            {
              "name": "vault_lp_supply_incl_fees_before",
              "type": "u64"
            },
            {
              "name": "vault_lp_supply_incl_fees_after",
              "type": "u64"
            },
            {
              "name": "vault_highest_asset_per_lp_decimal_bits_before",
              "type": "u128"
            },
            {
              "name": "vault_highest_asset_per_lp_decimal_bits_after",
              "type": "u128"
            },
            {
              "name": "vault_last_updated_ts",
              "type": "u64"
            }
          ]
        }
      }
    ]
  }