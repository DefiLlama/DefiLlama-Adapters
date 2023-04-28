const { getProvider, sumTokens2, } = require('../helper/solana')
const { Program, } = require("@project-serum/anchor");

async function tvl() {
  const provider = getProvider()
  const program = new Program(idl, idl.metadata.address, provider)
  const data = await program.account.pool.all()
  return sumTokens2({ tokenAccounts: data.map(({account: i}) => [i.poolXAccount.toString(), i.poolYAccount.toString()]).flat()})
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}

const idl = {
  version: '0.1.1',
  name: 'bonkswap',
  instructions: [],
  accounts: [
    {
      name: 'pool',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'tokenX',
            type: 'publicKey'
          },
          {
            name: 'tokenY',
            type: 'publicKey'
          },
          {
            name: 'poolXAccount',
            type: 'publicKey'
          },
          {
            name: 'poolYAccount',
            type: 'publicKey'
          },
          {
            name: 'admin',
            type: 'publicKey'
          },
          {
            name: 'projectOwner',
            type: 'publicKey'
          },
          {
            name: 'tokenXReserve',
            type: {
              defined: 'Token'
            }
          },
          {
            name: 'tokenYReserve',
            type: {
              defined: 'Token'
            }
          },
          {
            name: 'selfShares',
            type: {
              defined: 'Token'
            }
          },
          {
            name: 'allShares',
            type: {
              defined: 'Token'
            }
          },
          {
            name: 'buybackAmountX',
            type: {
              defined: 'Token'
            }
          },
          {
            name: 'buybackAmountY',
            type: {
              defined: 'Token'
            }
          },
          {
            name: 'projectAmountX',
            type: {
              defined: 'Token'
            }
          },
          {
            name: 'projectAmountY',
            type: {
              defined: 'Token'
            }
          },
          {
            name: 'mercantiAmountX',
            type: {
              defined: 'Token'
            }
          },
          {
            name: 'mercantiAmountY',
            type: {
              defined: 'Token'
            }
          },
          {
            name: 'lpAccumulatorX',
            type: {
              defined: 'FixedPoint'
            }
          },
          {
            name: 'lpAccumulatorY',
            type: {
              defined: 'FixedPoint'
            }
          },
          {
            name: 'constK',
            type: {
              defined: 'Product'
            }
          },
          {
            name: 'price',
            type: {
              defined: 'FixedPoint'
            }
          },
          {
            name: 'lpFee',
            type: {
              defined: 'FixedPoint'
            }
          },
          {
            name: 'buybackFee',
            type: {
              defined: 'FixedPoint'
            }
          },
          {
            name: 'projectFee',
            type: {
              defined: 'FixedPoint'
            }
          },
          {
            name: 'mercantiFee',
            type: {
              defined: 'FixedPoint'
            }
          },
          {
            name: 'farmCount',
            type: 'u64'
          },
          {
            name: 'bump',
            type: 'u8'
          }
        ]
      }
    },
  ],
  types: [
    {
      name: 'FixedPoint',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'v',
            type: 'u128'
          }
        ]
      }
    },
    {
      name: 'Token',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'v',
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'Product',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'v',
            type: 'u128'
          }
        ]
      }
    },
  ],
  errors: [],
  metadata: {
    address: 'BSwp6bEBihVLdqJRKGgzjcGLHkcTuzmSo1TQkHepzH8p',
  }
}
