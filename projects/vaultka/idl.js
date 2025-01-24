module.exports = {
    version: '0.1.0',
    name: 'marginfi',
    instructions: [],
    accounts: [
      {
        name: 'bank',
        type: {
          kind: 'struct',
          fields: [
            {
              name: 'mint',
              type: 'publicKey'
            },
            {
              name: 'mintDecimals',
              type: 'u8'
            },
            {
              name: 'group',
              type: 'publicKey'
            },
            {
              name: 'ignore1',
              type: {
                array: [
                  'u8',
                  7
                ]
              }
            },
            {
              name: 'assetShareValue',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'liabilityShareValue',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'liquidityVault',
              type: 'publicKey'
            },
            {
              name: 'liquidityVaultBump',
              type: 'u8'
            },
            {
              name: 'liquidityVaultAuthorityBump',
              type: 'u8'
            },
            {
              name: 'insuranceVault',
              type: 'publicKey'
            },
            {
              name: 'insuranceVaultBump',
              type: 'u8'
            },
            {
              name: 'insuranceVaultAuthorityBump',
              type: 'u8'
            },
            {
              name: 'ignore2',
              type: {
                array: [
                  'u8',
                  4
                ]
              }
            },
            {
              name: 'collectedInsuranceFeesOutstanding',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'feeVault',
              type: 'publicKey'
            },
            {
              name: 'feeVaultBump',
              type: 'u8'
            },
            {
              name: 'feeVaultAuthorityBump',
              type: 'u8'
            },
            {
              name: 'ignore3',
              type: {
                array: [
                  'u8',
                  6
                ]
              }
            },
            {
              name: 'collectedGroupFeesOutstanding',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'totalLiabilityShares',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'totalAssetShares',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'lastUpdate',
              type: 'i64'
            },
            {
              name: 'config',
              type: {
                defined: 'BankConfig'
              }
            },
            {
              name: 'emissionsFlags',
              docs: [
                'Emissions Config Flags',
                '',
                '- EMISSIONS_FLAG_BORROW_ACTIVE: 1',
                '- EMISSIONS_FLAG_LENDING_ACTIVE: 2',
                ''
              ],
              type: 'u64'
            },
            {
              name: 'emissionsRate',
              docs: [
                'Emissions APR.',
                'Number of emitted tokens (emissions_mint) per 1M tokens (bank mint) (native amount) per 1 YEAR.'
              ],
              type: 'u64'
            },
            {
              name: 'emissionsRemaining',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'emissionsMint',
              type: 'publicKey'
            },
            {
              name: 'padding0',
              type: {
                array: [
                  'u128',
                  28
                ]
              }
            },
            {
              name: 'padding1',
              type: {
                array: [
                  'u128',
                  32
                ]
              }
            }
          ]
        }
      }
    ],
    types: [
      {
        name: 'LendingAccount',
        type: {
          kind: 'struct',
          fields: [
            {
              name: 'balances',
              type: {
                array: [
                  {
                    defined: 'Balance'
                  },
                  16
                ]
              }
            },
            {
              name: 'padding',
              type: {
                array: [
                  'u64',
                  8
                ]
              }
            }
          ]
        }
      },
      {
        name: 'Balance',
        type: {
          kind: 'struct',
          fields: [
            {
              name: 'active',
              type: 'bool'
            },
            {
              name: 'bankPk',
              type: 'publicKey'
            },
            {
              name: 'ignore',
              type: {
                array: [
                  'u8',
                  7
                ]
              }
            },
            {
              name: 'assetShares',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'liabilityShares',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'emissionsOutstanding',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'lastUpdate',
              type: 'u64'
            },
            {
              name: 'padding',
              type: {
                array: [
                  'u64',
                  1
                ]
              }
            }
          ]
        }
      },
      {
        name: 'GroupConfig',
        type: {
          kind: 'struct',
          fields: [
            {
              name: 'admin',
              type: {
                option: 'publicKey'
              }
            }
          ]
        }
      },
      {
        name: 'InterestRateConfig',
        type: {
          kind: 'struct',
          fields: [
            {
              name: 'optimalUtilizationRate',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'plateauInterestRate',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'maxInterestRate',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'insuranceFeeFixedApr',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'insuranceIrFee',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'protocolFixedFeeApr',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'protocolIrFee',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'padding',
              type: {
                array: [
                  'u128',
                  8
                ]
              }
            }
          ]
        }
      },
      {
        name: 'InterestRateConfigOpt',
        type: {
          kind: 'struct',
          fields: [
            {
              name: 'optimalUtilizationRate',
              type: {
                option: {
                  defined: 'WrappedI80F48'
                }
              }
            },
            {
              name: 'plateauInterestRate',
              type: {
                option: {
                  defined: 'WrappedI80F48'
                }
              }
            },
            {
              name: 'maxInterestRate',
              type: {
                option: {
                  defined: 'WrappedI80F48'
                }
              }
            },
            {
              name: 'insuranceFeeFixedApr',
              type: {
                option: {
                  defined: 'WrappedI80F48'
                }
              }
            },
            {
              name: 'insuranceIrFee',
              type: {
                option: {
                  defined: 'WrappedI80F48'
                }
              }
            },
            {
              name: 'protocolFixedFeeApr',
              type: {
                option: {
                  defined: 'WrappedI80F48'
                }
              }
            },
            {
              name: 'protocolIrFee',
              type: {
                option: {
                  defined: 'WrappedI80F48'
                }
              }
            }
          ]
        }
      },
      {
        name: 'BankConfig',
        docs: [
          'TODO: Convert weights to (u64, u64) to avoid precision loss (maybe?)'
        ],
        type: {
          kind: 'struct',
          fields: [
            {
              name: 'assetWeightInit',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'assetWeightMaint',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'liabilityWeightInit',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'liabilityWeightMaint',
              type: {
                defined: 'WrappedI80F48'
              }
            },
            {
              name: 'depositLimit',
              type: 'u64'
            },
            {
              name: 'interestRateConfig',
              type: {
                defined: 'InterestRateConfig'
              }
            },
            {
              name: 'operationalState',
              type: {
                defined: 'BankOperationalState'
              }
            },
            {
              name: 'oracleSetup',
              type: 'u8'
            },
            {
              name: 'oracleKeys',
              type: {
                array: [
                  'publicKey',
                  5
                ]
              }
            },
            {
              name: 'ignore1',
              type: {
                array: [
                  'u8',
                  6
                ]
              }
            },
            {
              name: 'borrowLimit',
              type: 'u64'
            },
            {
              name: 'riskTier',
              type: {
                defined: 'RiskTier'
              }
            },
            {
              name: 'padding',
              type: {
                array: [
                  'u8',
                  55
                ]
              }
            }
          ]
        }
      },
      {
        name: 'WrappedI80F48',
        type: {
          kind: 'struct',
          fields: [
            {
              name: 'value',
              type: 'i128'
            }
          ]
        }
      },
      {
        name: 'BankConfigOpt',
        type: {
          kind: 'struct',
          fields: [
            {
              name: 'assetWeightInit',
              type: {
                option: {
                  defined: 'WrappedI80F48'
                }
              }
            },
            {
              name: 'assetWeightMaint',
              type: {
                option: {
                  defined: 'WrappedI80F48'
                }
              }
            },
            {
              name: 'liabilityWeightInit',
              type: {
                option: {
                  defined: 'WrappedI80F48'
                }
              }
            },
            {
              name: 'liabilityWeightMaint',
              type: {
                option: {
                  defined: 'WrappedI80F48'
                }
              }
            },
            {
              name: 'depositLimit',
              type: {
                option: 'u64'
              }
            },
            {
              name: 'borrowLimit',
              type: {
                option: 'u64'
              }
            },
            {
              name: 'operationalState',
              type: {
                option: {
                  defined: 'BankOperationalState'
                }
              }
            },
            {
              name: 'oracle',
              type: {
                option: {
                  defined: 'OracleConfig'
                }
              }
            },
            {
              name: 'interestRateConfig',
              type: {
                option: {
                  defined: 'InterestRateConfigOpt'
                }
              }
            },
            {
              name: 'riskTier',
              type: {
                option: {
                  defined: 'RiskTier'
                }
              }
            }
          ]
        }
      },
      {
        name: 'OracleConfig',
        type: {
          kind: 'struct',
          fields: [
            {
              name: 'setup',
              type: {
                defined: 'OracleSetup'
              }
            },
            {
              name: 'keys',
              type: {
                array: [
                  'publicKey',
                  5
                ]
              }
            }
          ]
        }
      },
      {
        name: 'BalanceIncreaseType',
        type: {
          kind: 'enum',
          variants: [
            {
              name: 'Any'
            },
            {
              name: 'RepayOnly'
            },
            {
              name: 'DepositOnly'
            }
          ]
        }
      },
      {
        name: 'BalanceDecreaseType',
        type: {
          kind: 'enum',
          variants: [
            {
              name: 'Any'
            },
            {
              name: 'WithdrawOnly'
            },
            {
              name: 'BorrowOnly'
            },
            {
              name: 'BypassBorrowLimit'
            }
          ]
        }
      },
      {
        name: 'WeightType',
        type: {
          kind: 'enum',
          variants: [
            {
              name: 'Initial'
            },
            {
              name: 'Maintenance'
            }
          ]
        }
      },
      {
        name: 'BalanceSide',
        type: {
          kind: 'enum',
          variants: [
            {
              name: 'Assets'
            },
            {
              name: 'Liabilities'
            }
          ]
        }
      },
      {
        name: 'RiskRequirementType',
        type: {
          kind: 'enum',
          variants: [
            {
              name: 'Initial'
            },
            {
              name: 'Maintenance'
            }
          ]
        }
      },
      {
        name: 'BankOperationalState',
        type: {
          kind: 'enum',
          variants: [
            {
              name: 'Paused'
            },
            {
              name: 'Operational'
            },
            {
              name: 'ReduceOnly'
            }
          ]
        }
      },
      {
        name: 'RiskTier',
        type: {
          kind: 'enum',
          variants: [
            {
              name: 'Collateral'
            },
            {
              name: 'Isolated'
            }
          ]
        }
      },
      {
        name: 'BankVaultType',
        type: {
          kind: 'enum',
          variants: [
            {
              name: 'Liquidity'
            },
            {
              name: 'Insurance'
            },
            {
              name: 'Fee'
            }
          ]
        }
      },
      {
        name: 'OracleSetup',
        type: {
          kind: 'enum',
          variants: [
            {
              name: 'None'
            },
            {
              name: 'PythEma'
            },
            {
              name: 'SwitchboardV2'
            }
          ]
        }
      }
    ],
    events: [],
    errors: []
  }