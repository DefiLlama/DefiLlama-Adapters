const { getProvider, sumTokens2, } = require('../helper/solana')
const { Program } = require("@project-serum/anchor");

async function getTokenAccounts(programId, idl, chain) {
  const provider = getProvider(chain)
  console.log(programId, chain)
  const program = new Program(idl, programId, provider)
  const data = await program.account.amm.all()
  return data.map(({ account: { tokenAAccount, tokenBAccount }}) => ([tokenAAccount, tokenBAccount,])).flat()
}

const config = {
  solana: '2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c',
  eclipse: '4UsSbJQZJTfZDFrgvcPBRCSg5BbcQE6dobnriCafzj12',
}

async function tvl(api) {
  const tokenAccounts = await getTokenAccounts(config[api.chain], v2Idl, api.chain)
  return sumTokens2({ tokenAccounts, api, })
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
  eclipse: { tvl, },
}

const v2Idl = {
  version: "0.1.1",
  name: "lifinity_amm_v2",
  instructions: [],
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
  errors: []
}
