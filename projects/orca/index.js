const { getProvider, sumTokens2, exportDexTVL, } = require('../helper/solana')
const { Program, AnchorProvider } = require("@project-serum/anchor");
const sdk = require('@defillama/sdk')
const { Connection, PublicKey } = require('@solana/web3.js')

// const eclipseRpc = 'https://eclipse.helius-rpc.com'
const eclipseRpc = 'https://mainnetbeta-rpc.eclipse.xyz'

async function eclipseTvl (api) {
  const connection = new Connection(eclipseRpc)
  const provider = new AnchorProvider(connection, getProvider(api.chain).wallet)
  const programId = new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')
  const program = new Program(whirpoolIDL, programId, provider)

  const rawAccounts = await connection.getProgramAccounts(programId, {
    filters: [{ dataSize: 653 }],
  })

  const whirlpools = rawAccounts.map(({ account }) =>
    program.account.whirlpool.coder.accounts.decode('whirlpool', account.data)
  )

  const tokenAccounts = whirlpools.flatMap(({ tokenVaultA, tokenVaultB }) => [tokenVaultA, tokenVaultB])
  return sumTokens2({ tokenAccounts, api })
}

const WHIRLPOOL_PROGRAM_ID = new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')

// Whirlpool account (dataSize=653), we slice bytes 133-245 to get the vaults
const VAULT_A_OFFSET = 133
const SLICE_LEN = 112
// original_offset - VAULT_A_OFFSET
const VAULT_A_IN_SLICE = 0
const VAULT_B_IN_SLICE = 80
// circumvent RPC scan-limit on getProgramAccounts
const PREFIX_BUCKETS = 256
const SWEEP_CONCURRENCY = 3

async function fetchPrefix(conn, prefix) {
  const accounts = await conn.getProgramAccounts(WHIRLPOOL_PROGRAM_ID, {
    filters: [
      { dataSize: 653 },
      { memcmp: { offset: VAULT_A_OFFSET, bytes: Buffer.from([prefix]).toString('base64'), encoding: 'base64' } },
    ],
    dataSlice: { offset: VAULT_A_OFFSET, length: SLICE_LEN },
  })

  const vaults = []
  for (const { account } of accounts) {
    const d = account.data
    vaults.push(new PublicKey(d.slice(VAULT_A_IN_SLICE, VAULT_A_IN_SLICE + 32)).toBase58())
    vaults.push(new PublicKey(d.slice(VAULT_B_IN_SLICE, VAULT_B_IN_SLICE + 32)).toBase58())
  }
  return { vaults }
}

async function tvl(api) {
  const conn = getProvider(api.chain).connection
  const allVaults = []

  await sdk.util.runInPromisePool({
    concurrency: SWEEP_CONCURRENCY,
    items: Array.from({ length: PREFIX_BUCKETS }, (_, i) => i),
    processor: async (prefix) => {
      const r = await fetchPrefix(conn, prefix)
      allVaults.push(...r.vaults)
    },
  })

  return sumTokens2({ api, tokenAccounts: allVaults, allowError: true })
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

const orcaV1Tvl = exportDexTVL('DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1')
const orcaV2Tvl = exportDexTVL('9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP')

module.exports = {
  timetravel: false,
  solana: { tvl: sdk.util.sumChainTvls([orcaV1Tvl, orcaV2Tvl, tvl]) },
  eclipse: { tvl: eclipseTvl },
  isHeavyProtocol: true,
  hallmarks: [
    ['2021-08-10', "Token+LM launch"],
    ['2022-11-08', "FTX collapse"]
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
