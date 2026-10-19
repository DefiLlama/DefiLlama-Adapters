const { getProvider, sumTokens2, exportDexTVL, transformBalances, blacklistedTokens_default, } = require('../helper/solana')
const { Program, AnchorProvider } = require("@project-serum/anchor");
const sdk = require('@defillama/sdk')
const { Connection, PublicKey } = require('@solana/web3.js')
const { sleep, sliceIntoChunks } = require('../helper/utils')

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

// Whirlpool account (dataSize=653), we slice bytes 49-245 to get liquidity and the vaults
const LIQUIDITY_OFFSET = 49
const VAULT_A_OFFSET = 133
const SLICE_LEN = 196
// original_offset - LIQUIDITY_OFFSET
const VAULT_A_IN_SLICE = 84
const VAULT_B_IN_SLICE = 164
// circumvent RPC scan-limit on getProgramAccounts
const PREFIX_BUCKETS = 256
const SWEEP_CONCURRENCY = 3
const BALANCE_CONCURRENCY = 3

// the solana RPC rate limits (429) bursts, back off instead of failing the whole pool
async function withRetry(fn, retries = 5) {
  for (let i = 0; ; i++) {
    try {
      return await fn()
    } catch (e) {
      if (i >= retries) throw e
      await sleep(1000 * 2 ** i)
    }
  }
}

async function fetchPrefix(conn, prefix) {
  const accounts = await withRetry(() => conn.getProgramAccounts(WHIRLPOOL_PROGRAM_ID, {
    filters: [
      { dataSize: 653 },
      { memcmp: { offset: VAULT_A_OFFSET, bytes: Buffer.from([prefix]).toString('base64'), encoding: 'base64' } },
    ],
    dataSlice: { offset: LIQUIDITY_OFFSET, length: SLICE_LEN },
  }))

  const vaults = []
  for (const { account } of accounts) {
    const d = account.data
    // ~half of all whirlpools have no in-range liquidity and hold <1% of the value, skip them
    if (d.readBigUInt64LE(0) === 0n && d.readBigUInt64LE(8) === 0n) continue
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

  // sumTokens2 reads token accounts one chunk at a time with a sleep in between, too slow for ~100k+ vaults
  // only the mint (0-32) and amount (64-72) of each token account are needed
  const infos = []
  await sdk.util.runInPromisePool({
    concurrency: BALANCE_CONCURRENCY,
    items: sliceIntoChunks(allVaults, 99),
    processor: async (accounts) => {
      infos.push(...await withRetry(() => sdk.chains.svm.getAccounts({ chain: api.chain, accounts, dataSlice: { offset: 0, length: 72 }, chunkSize: 99, concurrency: 1 })))
    },
  })
  const tokenBalances = {}
  for (const info of infos) {
    if (!info) continue
    const d = Buffer.from(info.data[0], 'base64')
    const mint = new PublicKey(d.subarray(0, 32)).toBase58()
    if (blacklistedTokens_default.includes(mint)) continue
    sdk.util.sumSingleBalance(tokenBalances, mint, d.readBigUInt64LE(64).toString())
  }
  return transformBalances({ tokenBalances, balances: api.getBalances(), chain: api.chain })
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
