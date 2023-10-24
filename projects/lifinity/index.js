const { getProvider, sumTokens2, } = require('../helper/solana')
const { Program } = require("@project-serum/anchor");

async function getTokenAccounts(programId, idl) {
  const provider = getProvider()
  const program = new Program(idl, programId, provider)
  const data = await program.account.amm.all()
  return data.map(({ account: { tokenAAccount, tokenBAccount }}) => ([tokenAAccount, tokenBAccount,])).flat()
}

async function tvl() {
  const v1TokenAccounts = await getTokenAccounts('EewxydAPCCVuNEyrVN68PuSYdQ7wKn27V9Gjeoi8dy3S', v1Idl)
  const v2TokenAccounts = await getTokenAccounts('2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c', v2Idl)

  const tokenAccounts = [...v1TokenAccounts, ...v2TokenAccounts]

  return sumTokens2({ tokenAccounts, })
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}

const v1Idl = {
  version: '0.1.0',
  name: 'lifinity_amm',
  instructions: [],
  accounts: [
    {
      name: 'amm',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'initializerKey',
            type: 'publicKey'
          },
          {
            name: 'initializerDepositTokenAccount',
            type: 'publicKey'
          },
          {
            name: 'initializerReceiveTokenAccount',
            type: 'publicKey'
          },
          {
            name: 'initializerAmount',
            type: 'u64'
          },
          {
            name: 'takerAmount',
            type: 'u64'
          },
          {
            name: 'isInitialized',
            type: 'bool'
          },
          {
            name: 'bumpSeed',
            type: 'u8'
          },
          {
            name: 'freezeTrade',
            type: 'u8'
          },
          {
            name: 'freezeDeposit',
            type: 'u8'
          },
          {
            name: 'freezeWithdraw',
            type: 'u8'
          },
          {
            name: 'baseDecimals',
            type: 'u8'
          },
          {
            name: 'tokenProgramId',
            type: 'publicKey'
          },
          {
            name: 'tokenAAccount',
            type: 'publicKey'
          },
          {
            name: 'tokenBAccount',
            type: 'publicKey'
          },
          {
            name: 'poolMint',
            type: 'publicKey'
          },
          {
            name: 'tokenAMint',
            type: 'publicKey'
          },
          {
            name: 'tokenBMint',
            type: 'publicKey'
          },
          {
            name: 'poolFeeAccount',
            type: 'publicKey'
          },
          {
            name: 'pythAccount',
            type: 'publicKey'
          },
          {
            name: 'pythPcAccount',
            type: 'publicKey'
          },
          {
            name: 'configAccount',
            type: 'publicKey'
          },
          {
            name: 'ammTemp1',
            type: 'publicKey'
          },
          {
            name: 'ammTemp2',
            type: 'publicKey'
          },
          {
            name: 'ammTemp3',
            type: 'publicKey'
          },
          {
            name: 'fees',
            type: {
              defined: 'FeesInput'
            }
          },
          {
            name: 'curve',
            type: {
              defined: 'CurveInput'
            }
          }
        ]
      }
    }
  ],
  types: [
    {
      name: 'FeesInput',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'tradeFeeNumerator',
            type: 'u64'
          },
          {
            name: 'tradeFeeDenominator',
            type: 'u64'
          },
          {
            name: 'ownerTradeFeeNumerator',
            type: 'u64'
          },
          {
            name: 'ownerTradeFeeDenominator',
            type: 'u64'
          },
          {
            name: 'ownerWithdrawFeeNumerator',
            type: 'u64'
          },
          {
            name: 'ownerWithdrawFeeDenominator',
            type: 'u64'
          },
          {
            name: 'hostFeeNumerator',
            type: 'u64'
          },
          {
            name: 'hostFeeDenominator',
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'CurveInput',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'curveType',
            type: 'u8'
          },
          {
            name: 'curveParameters',
            type: 'u64'
          }
        ]
      }
    }
  ],
  errors: []
}

const v2Idl = {
  version: "0.1.1",
  name: "lifinity_amm_v2",
  instructions: [
    {
      name: "swap",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: false
        },
        {
          name: "amm",
          isMut: true,
          isSigner: false
        },
        {
          name: "userTransferAuthority",
          isMut: false,
          isSigner: true
        },
        {
          name: "sourceInfo",
          isMut: true,
          isSigner: false
        },
        {
          name: "destinationInfo",
          isMut: true,
          isSigner: false
        },
        {
          name: "swapSource",
          isMut: true,
          isSigner: false
        },
        {
          name: "swapDestination",
          isMut: true,
          isSigner: false
        },
        {
          name: "poolMint",
          isMut: true,
          isSigner: false
        },
        {
          name: "feeAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "oracleMainAccount",
          isMut: false,
          isSigner: false
        },
        {
          name: "oracleSubAccount",
          isMut: false,
          isSigner: false
        },
        {
          name: "oraclePcAccount",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "amountIn",
          type: "u64"
        },
        {
          name: "minimumAmountOut",
          type: "u64"
        }
      ]
    }
  ],
  accounts: [
    {
      name: "Amm",
      type: {
        kind: "struct",
        fields: [
          {
            name: "initializerKey",
            type: "publicKey"
          },
          {
            name: "initializerDepositTokenAccount",
            type: "publicKey"
          },
          {
            name: "initializerReceiveTokenAccount",
            type: "publicKey"
          },
          {
            name: "initializerAmount",
            type: "u64"
          },
          {
            name: "takerAmount",
            type: "u64"
          },
          {
            name: "isInitialized",
            type: "bool"
          },
          {
            name: "bumpSeed",
            type: "u8"
          },
          {
            name: "freezeTrade",
            type: "u8"
          },
          {
            name: "freezeDeposit",
            type: "u8"
          },
          {
            name: "freezeWithdraw",
            type: "u8"
          },
          {
            name: "baseDecimals",
            type: "u8"
          },
          {
            name: "tokenProgramId",
            type: "publicKey"
          },
          {
            name: "tokenAAccount",
            type: "publicKey"
          },
          {
            name: "tokenBAccount",
            type: "publicKey"
          },
          {
            name: "poolMint",
            type: "publicKey"
          },
          {
            name: "tokenAMint",
            type: "publicKey"
          },
          {
            name: "tokenBMint",
            type: "publicKey"
          },
          {
            name: "feeAccount",
            type: "publicKey"
          },
          {
            name: "oracleMainAccount",
            type: "publicKey"
          },
          {
            name: "oracleSubAccount",
            type: "publicKey"
          },
          {
            name: "oraclePcAccount",
            type: "publicKey"
          },
          {
            name: "fees",
            type: {
              defined: "AmmFees"
            }
          },
          {
            name: "curve",
            type: {
              defined: "AmmCurve"
            }
          },
          {
            name: "config",
            type: {
              defined: "AmmConfig"
            }
          },
          {
            name: "ammPTemp1",
            type: "publicKey"
          },
          {
            name: "ammPTemp2",
            type: "publicKey"
          },
          {
            name: "ammPTemp3",
            type: "publicKey"
          },
          {
            name: "ammPTemp4",
            type: "publicKey"
          },
          {
            name: "ammPTemp5",
            type: "publicKey"
          }
        ]
      }
    }
  ],
  types: [
    {
      name: "AmmFees",
      docs: [
        "Encapsulates all fee information and calculations for swap operations"
      ],
      type: {
        kind: "struct",
        fields: [
          {
            name: "tradeFeeNumerator",
            type: "u64"
          },
          {
            name: "tradeFeeDenominator",
            type: "u64"
          },
          {
            name: "ownerTradeFeeNumerator",
            type: "u64"
          },
          {
            name: "ownerTradeFeeDenominator",
            type: "u64"
          },
          {
            name: "ownerWithdrawFeeNumerator",
            type: "u64"
          },
          {
            name: "ownerWithdrawFeeDenominator",
            type: "u64"
          },
          {
            name: "hostFeeNumerator",
            type: "u64"
          },
          {
            name: "hostFeeDenominator",
            type: "u64"
          }
        ]
      }
    },
    {
      name: "AmmCurve",
      type: {
        kind: "struct",
        fields: [
          {
            name: "curveType",
            type: "u8"
          },
          {
            name: "curveParameters",
            type: "u64"
          }
        ]
      }
    },
    {
      name: "AmmConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "lastPrice",
            type: "u64"
          },
          {
            name: "lastBalancedPrice",
            type: "u64"
          },
          {
            name: "configDenominator",
            type: "u64"
          },
          {
            name: "volumeX",
            type: "u64"
          },
          {
            name: "volumeY",
            type: "u64"
          },
          {
            name: "volumeXInY",
            type: "u64"
          },
          {
            name: "depositCap",
            type: "u64"
          },
          {
            name: "regressionTarget",
            type: "u64"
          },
          {
            name: "oracleType",
            type: "u64"
          },
          {
            name: "oracleStatus",
            type: "u64"
          },
          {
            name: "oracleMainSlotLimit",
            type: "u64"
          },
          {
            name: "oracleSubConfidenceLimit",
            type: "u64"
          },
          {
            name: "oracleSubSlotLimit",
            type: "u64"
          },
          {
            name: "oraclePcConfidenceLimit",
            type: "u64"
          },
          {
            name: "oraclePcSlotLimit",
            type: "u64"
          },
          {
            name: "stdSpread",
            type: "u64"
          },
          {
            name: "stdSpreadBuffer",
            type: "u64"
          },
          {
            name: "spreadCoefficient",
            type: "u64"
          },
          {
            name: "priceBufferCoin",
            type: "i64"
          },
          {
            name: "priceBufferPc",
            type: "i64"
          },
          {
            name: "rebalanceRatio",
            type: "u64"
          },
          {
            name: "feeTrade",
            type: "u64"
          },
          {
            name: "feePlatform",
            type: "u64"
          },
          {
            name: "oracleMainSlotBuffer",
            type: "u64"
          },
          {
            name: "configTemp4",
            type: "u64"
          },
          {
            name: "configTemp5",
            type: "u64"
          },
          {
            name: "configTemp6",
            type: "u64"
          },
          {
            name: "configTemp7",
            type: "u64"
          },
          {
            name: "configTemp8",
            type: "u64"
          }
        ]
      }
    },
    {
      name: "CurveType",
      docs: [
        "Curve types supported by the token-swap program."
      ],
      type: {
        kind: "enum",
        variants: [
          {
            name: "Standard"
          },
          {
            name: "ConstantProduct"
          }
        ]
      }
    }
  ],
  errors: [
    {
      code: 6000,
      name: "AlreadyInUse",
      msg: "Swap account already in use"
    },
    {
      code: 6001,
      name: "InvalidProgramAddress",
      msg: "Invalid program address generated from bump seed and key"
    },
    {
      code: 6002,
      name: "InvalidOwner",
      msg: "Input account owner is not the program address"
    },
    {
      code: 6003,
      name: "InvalidOutputOwner",
      msg: "Output pool account owner cannot be the program address"
    },
    {
      code: 6004,
      name: "ExpectedMint",
      msg: "Deserialized account is not an SPL Token mint"
    },
    {
      code: 6005,
      name: "ExpectedAccount",
      msg: "Deserialized account is not an SPL Token account"
    },
    {
      code: 6006,
      name: "EmptySupply",
      msg: "Input token account empty"
    },
    {
      code: 6007,
      name: "InvalidSupply",
      msg: "Pool token mint has a non-zero supply"
    },
    {
      code: 6008,
      name: "InvalidDelegate",
      msg: "Token account has a delegate"
    },
    {
      code: 6009,
      name: "InvalidInput",
      msg: "InvalidInput"
    },
    {
      code: 6010,
      name: "IncorrectSwapAccount",
      msg: "Address of the provided swap token account is incorrect"
    },
    {
      code: 6011,
      name: "IncorrectPoolMint",
      msg: "Address of the provided pool token mint is incorrect"
    },
    {
      code: 6012,
      name: "InvalidOutput",
      msg: "InvalidOutput"
    },
    {
      code: 6013,
      name: "CalculationFailure",
      msg: "General calculation failure due to overflow or underflow"
    },
    {
      code: 6014,
      name: "InvalidInstruction",
      msg: "Invalid instruction"
    },
    {
      code: 6015,
      name: "RepeatedMint",
      msg: "Swap input token accounts have the same mint"
    },
    {
      code: 6016,
      name: "ExceededSlippage",
      msg: "Swap instruction exceeds desired slippage limit"
    },
    {
      code: 6017,
      name: "InvalidCloseAuthority",
      msg: "Token account has a close authority"
    },
    {
      code: 6018,
      name: "InvalidFreezeAuthority",
      msg: "Pool token mint has a freeze authority"
    },
    {
      code: 6019,
      name: "IncorrectFeeAccount",
      msg: "Pool fee token account incorrect"
    },
    {
      code: 6020,
      name: "ZeroTradingTokens",
      msg: "Given pool token amount results in zero trading tokens"
    },
    {
      code: 6021,
      name: "FeeCalculationFailure",
      msg: "Fee calculation failed due to overflow, underflow, or unexpected 0"
    },
    {
      code: 6022,
      name: "ConversionFailure",
      msg: "Conversion to u64 failed with an overflow or underflow"
    },
    {
      code: 6023,
      name: "InvalidFee",
      msg: "The provided fee does not match the program owner's constraints"
    },
    {
      code: 6024,
      name: "IncorrectTokenProgramId",
      msg: "The provided token program does not match the token program expected by the swap"
    },
    {
      code: 6025,
      name: "IncorrectOracleAccount",
      msg: "Address of the provided oracle account is incorrect"
    },
    {
      code: 6026,
      name: "IncorrectConfigAccount",
      msg: "Address of the provided config account is incorrect"
    },
    {
      code: 6027,
      name: "UnsupportedCurveType",
      msg: "The provided curve type is not supported by the program owner"
    },
    {
      code: 6028,
      name: "InvalidCurve",
      msg: "The provided curve parameters are invalid"
    },
    {
      code: 6029,
      name: "UnsupportedCurveOperation",
      msg: "The operation cannot be performed on the given curve"
    },
    {
      code: 6030,
      name: "InvalidPythStatus",
      msg: "Pyth oracle status is not 'trading'"
    },
    {
      code: 6031,
      name: "InvalidPythPrice",
      msg: "Could not retrieve updated price feed from the Pyth oracle"
    },
    {
      code: 6032,
      name: "IncorrectSigner",
      msg: "Address of the provided signer account is incorrect"
    },
    {
      code: 6033,
      name: "ExceedPoolBalance",
      msg: "Swap amount exceeds pool balance"
    },
    {
      code: 6034,
      name: "ProgramIsFrozen",
      msg: "Program is frozen"
    },
    {
      code: 6035,
      name: "OracleConfidence",
      msg: "Oracle confidence is too high"
    },
    {
      code: 6036,
      name: "OverCapAmount",
      msg: "Over Pool Cap Amount"
    },
    {
      code: 6037,
      name: "InvalidUpdateAccount",
      msg: "Invalid update wallet address"
    },
    {
      code: 6038,
      name: "InvalidUpdateParam",
      msg: "Invalid update param"
    },
    {
      code: 6039,
      name: "InvalidInnerSwapAccount",
      msg: "Invalid inner swap account"
    }
  ],
  metadata: {
    address: "2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c"
  }
}
