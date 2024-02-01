const { getProvider, sumTokens2, } = require('../helper/solana')
const { Program, } = require("@project-serum/anchor")

async function tvl() {
  const provider = getProvider()
  const programId = 'pAMMTYk2C9tAxenepGk8a1bi9JQtUdnzu3UAh7NxYcW'
  const program = new Program(idl, programId, provider)
  const data = await program.account.pool.all()
  return sumTokens2({ tokenAccounts: data.map(i => i.account.collateralVault.toBase58()) })
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}

const idl = {
  version: '0.0.3',
  name: 'parcl_v2_core',
  constants: [],
  instructions: [],
  accounts: [
    {
      name: 'pool',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'version',
            type: 'u8'
          },
          {
            name: 'bumpSeed',
            type: {
              array: [
                'u8',
                1
              ]
            }
          },
          {
            name: 'tradeFeeRateSeed',
            type: {
              array: [
                'u8',
                2
              ]
            }
          },
          {
            name: 'liquidationFeeRateSeed',
            type: {
              array: [
                'u8',
                2
              ]
            }
          },
          {
            name: 'liquidationThresholdSeed',
            type: {
              array: [
                'u8',
                2
              ]
            }
          },
          {
            name: 'minLeverageSeed',
            type: {
              array: [
                'u8',
                1
              ]
            }
          },
          {
            name: 'maxLeverageSeed',
            type: {
              array: [
                'u8',
                1
              ]
            }
          },
          {
            name: 'maxNegativeSkewImpactSeed',
            type: {
              array: [
                'u8',
                8
              ]
            }
          },
          {
            name: 'oracleType',
            type: 'u8'
          },
          {
            name: 'minLeverage',
            type: 'u8'
          },
          {
            name: 'maxLeverage',
            type: 'u8'
          },
          {
            name: 'tradeFeeRate',
            type: 'u16'
          },
          {
            name: 'liquidationFeeRate',
            type: 'u16'
          },
          {
            name: 'liquidationThreshold',
            type: 'u16'
          },
          {
            name: 'state',
            type: 'publicKey'
          },
          {
            name: 'creator',
            type: 'publicKey'
          },
          {
            name: 'priceFeed',
            type: 'publicKey'
          },
          {
            name: 'liquidityTokenMint',
            type: 'publicKey'
          },
          {
            name: 'liquidityTokenVault',
            type: 'publicKey'
          },
          {
            name: 'collateralMint',
            type: 'publicKey'
          },
          {
            name: 'collateralVault',
            type: 'publicKey'
          },
          {
            name: 'protocolFeeVault',
            type: 'publicKey'
          },
          {
            name: 'skewManager',
            type: {
              defined: 'SkewManager'
            }
          },
          {
            name: 'reserved0',
            type: 'u128'
          },
          {
            name: 'reserved1',
            type: 'u128'
          },
          {
            name: 'reserved2',
            type: 'publicKey'
          },
          {
            name: 'reserved3',
            type: 'publicKey'
          }
        ]
      }
    }
  ],
  types: [
    {
      name: 'SkewManager',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'maxNegativeSkewImpact',
            type: 'u64'
          },
          {
            name: 'lastTimestamp',
            type: 'i64'
          },
          {
            name: 'cumulativeFundingRate',
            type: 'i128'
          },
          {
            name: 'openInterestLong',
            type: 'u128'
          },
          {
            name: 'openInterestShort',
            type: 'u128'
          }
        ]
      }
    }
  ],
  errors: []
}