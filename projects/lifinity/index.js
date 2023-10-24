const { getProvider, sumTokens2, } = require('../helper/solana')
const { Program, } = require("@project-serum/anchor");

async function tvl() {
  const provider = getProvider()
  const programId = 'EewxydAPCCVuNEyrVN68PuSYdQ7wKn27V9Gjeoi8dy3S'
  const program = new Program(idl, programId, provider)
  const data = await program.account.amm.all()
  const tokenAccounts = data.map(({ account: { tokenAAccount, tokenBAccount }}) => ([tokenAAccount, tokenBAccount,])).flat()
  return sumTokens2({ tokenAccounts, })
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}

const idl = {
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