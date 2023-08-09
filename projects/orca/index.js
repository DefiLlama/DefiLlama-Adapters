const { getProvider, sumTokens2, exportDexTVL, } = require('../helper/solana')
const { Program, } = require("@project-serum/anchor");
const sdk = require('@defillama/sdk')

async function tvl() {
  const provider = getProvider()
  const programId = 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'
  const program = new Program(whirpoolIDL, programId, provider)
  const whirlpools = await program.account.whirlpool.all()
  const tokenAccounts = whirlpools.map(({ account}) => [account.tokenVaultA, account.tokenVaultB]).flat()
  return sumTokens2({ tokenAccounts, })
}

/* async function orcaPoolTvlViaConfig() {
  const tokenAccounts = []
  const v1ProgramId = 'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1'
  const { pools } = await getConfig('orca/pools', 'https://api.orca.so/configs')
  Object.values(pools).forEach(i => {
    tokenAccounts.push(i.tokenAccountA)
    tokenAccounts.push(i.tokenAccountB)
  })
  return sumTokens2({ tokenAccounts, blacklistedTokens, })
} */

const orcaV1Tvl =  exportDexTVL('DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1')
const orcaV2Tvl =  exportDexTVL('9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP')

module.exports = {
  timetravel: false,
  solana: {
    tvl: sdk.util.sumChainTvls([orcaV1Tvl, orcaV2Tvl, tvl])
  },
  hallmarks: [
    [1628565707, "Token+LM launch"],
    [1667865600, "FTX collapse"]
  ]
};

const whirpoolIDL = {
  version: '0.2.0',
  name: 'whirlpool',
  instructions: [],
  accounts: [
    {
      name: 'whirlpoolsConfig',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'feeAuthority',
            type: 'publicKey'
          },
          {
            name: 'collectProtocolFeesAuthority',
            type: 'publicKey'
          },
          {
            name: 'rewardEmissionsSuperAuthority',
            type: 'publicKey'
          },
          {
            name: 'defaultProtocolFeeRate',
            type: 'u16'
          }
        ]
      }
    },
    {
      name: 'whirlpool',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'whirlpoolsConfig',
            type: 'publicKey'
          },
          {
            name: 'whirlpoolBump',
            type: {
              array: [
                'u8',
                1
              ]
            }
          },
          {
            name: 'tickSpacing',
            type: 'u16'
          },
          {
            name: 'tickSpacingSeed',
            type: {
              array: [
                'u8',
                2
              ]
            }
          },
          {
            name: 'feeRate',
            type: 'u16'
          },
          {
            name: 'protocolFeeRate',
            type: 'u16'
          },
          {
            name: 'liquidity',
            type: 'u128'
          },
          {
            name: 'sqrtPrice',
            type: 'u128'
          },
          {
            name: 'tickCurrentIndex',
            type: 'i32'
          },
          {
            name: 'protocolFeeOwedA',
            type: 'u64'
          },
          {
            name: 'protocolFeeOwedB',
            type: 'u64'
          },
          {
            name: 'tokenMintA',
            type: 'publicKey'
          },
          {
            name: 'tokenVaultA',
            type: 'publicKey'
          },
          {
            name: 'feeGrowthGlobalA',
            type: 'u128'
          },
          {
            name: 'tokenMintB',
            type: 'publicKey'
          },
          {
            name: 'tokenVaultB',
            type: 'publicKey'
          },
          {
            name: 'feeGrowthGlobalB',
            type: 'u128'
          },
          {
            name: 'rewardLastUpdatedTimestamp',
            type: 'u64'
          },
          {
            name: 'rewardInfos',
            type: {
              array: [
                {
                  defined: 'WhirlpoolRewardInfo'
                },
                3
              ]
            }
          }
        ]
      }
    }
  ],
  types: [
    {
      name: 'WhirlpoolRewardInfo',
      docs: [
        'Stores the state relevant for tracking liquidity mining rewards at the `Whirlpool` level.',
        'These values are used in conjunction with `PositionRewardInfo`, `Tick.reward_growths_outside`,',
        'and `Whirlpool.reward_last_updated_timestamp` to determine how many rewards are earned by open',
        'positions.'
      ],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'mint',
            docs: [
              'Reward token mint.'
            ],
            type: 'publicKey'
          },
          {
            name: 'vault',
            docs: [
              'Reward vault token account.'
            ],
            type: 'publicKey'
          },
          {
            name: 'authority',
            docs: [
              'Authority account that has permission to initialize the reward and set emissions.'
            ],
            type: 'publicKey'
          },
          {
            name: 'emissionsPerSecondX64',
            docs: [
              'Q64.64 number that indicates how many tokens per second are earned per unit of liquidity.'
            ],
            type: 'u128'
          },
          {
            name: 'growthGlobalX64',
            docs: [
              'Q64.64 number that tracks the total tokens earned per unit of liquidity since the reward',
              'emissions were turned on.'
            ],
            type: 'u128'
          }
        ]
      }
    }
  ],
  errors: []
}
