const { getProvider, sumTokens2, exportDexTVL, } = require('../helper/solana')
const { Program, AnchorProvider } = require("@project-serum/anchor");
const sdk = require('@defillama/sdk')
const { Connection, PublicKey } = require('@solana/web3.js')
const ADDRESSES = require('../helper/coreAssets.json')

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

// Whirlpool account (dataSize=653), we slice bytes 49-245 to get liquidity, mints, and vaults
const LIQUIDITY_OFFSET = 49
const VAULT_A_OFFSET = 133
const SLICE_LEN = 196
// original_offset - LIQUIDITY_OFFSET
const MINT_A_IN_SLICE = 52
const VAULT_A_IN_SLICE = 84
const MINT_B_IN_SLICE = 132
const VAULT_B_IN_SLICE = 164
// circumvent RPC scan-limit on getProgramAccounts
const PREFIX_BUCKETS = 256
const SWEEP_CONCURRENCY = 3

function readU128LE(buf, offset) {
  const lo = buf.readBigUInt64LE(offset)
  const hi = buf.readBigUInt64LE(offset + 8)
  return (hi << 64n) | lo
}

async function fetchPrefix(conn, prefix) {
  const accounts = await conn.getProgramAccounts(WHIRLPOOL_PROGRAM_ID, {
    filters: [
      { dataSize: 653 },
      { memcmp: { offset: VAULT_A_OFFSET, bytes: Buffer.from([prefix]).toString('base64'), encoding: 'base64' } },
    ],
    dataSlice: { offset: LIQUIDITY_OFFSET, length: SLICE_LEN },
  })

  const vaults = []
  for (const { account } of accounts) {
    const d = account.data
    const mintA = new PublicKey(d.slice(MINT_A_IN_SLICE, MINT_A_IN_SLICE + 32)).toBase58()
    const mintB = new PublicKey(d.slice(MINT_B_IN_SLICE, MINT_B_IN_SLICE + 32)).toBase58()
    const aPriced = WHITELIST.has(mintA)
    const bPriced = WHITELIST.has(mintB)
    if (!aPriced && !bPriced) continue
    if (aPriced) vaults.push(new PublicKey(d.slice(VAULT_A_IN_SLICE, VAULT_A_IN_SLICE + 32)).toBase58())
    if (bPriced) vaults.push(new PublicKey(d.slice(VAULT_B_IN_SLICE, VAULT_B_IN_SLICE + 32)).toBase58())
  }
  return { vaults }
}

async function tvl(api) {
  const conn = getProvider(api.chain).connection
  const start = Date.now()
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

// without filtering it query prices for >80k tokens
const WHITELIST = new Set([
  ADDRESSES.solana.USDC,
  ADDRESSES.solana.SOL,
  ADDRESSES.solana.USDT,
  ADDRESSES.solana.JitoSOL,
  ADDRESSES.solana.JUP,
  ADDRESSES.solana.bSOL,
  ADDRESSES.solana.PYUSD,
  ADDRESSES.solana.BONK,
  ADDRESSES.solana.PUMP,
  '6FrrzDk5mQARGc1TDYoyVnSyRdds1t4PbtohCD6p3tgG', // USX
  '2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH', // USDG
  'DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT', // USDe
  'cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij',  // cbBTC
  'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH', // CASH
  'AvZZF1YaZDziPY2RCK4oJrRVrbN3mTD9NL24hPeaZeUj', // syrupUSDC
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', // WETH (Wormhole)
  '27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4', // JLP
  'JuprjznTrTSp2UFa3ZBUFgwdAmtZCq4MQCwysN55USD',  // JupUSD
  'CtzPWv73Sn1dMGVU3ZtLv9yWSyUAanBni19YWDaznnkn', // xBTC
  'A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6', // USDY
  '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump', // FARTCOIN
  '9ckR7pPPvyPadACDTzLwK2ZAEeUJ3qGSnzPs8bVaHrSy', // USDU
  'KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS',  // KMNO
  'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',  // ORCA
  'A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS', // ZEC (Wormhole)
  '3ThdFZQKM6kRyVGLG48kaPg5TRMhYMKY1iCRa9xop1WC', // eUSX
  '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh', // WBTC (Wormhole)
  '5YMkXAYccHSGnHn9nob9xEvv6Pvka9DZWH7nTbotTu9E', // hyUSD
  'METADDFL6wWMWEoKTFJwcThTbUmtarRJZjRpzUvkxhr',  // META
  'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',  // JTO
  '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN', // TRUMP
  '3dQTr7ror2QPKQ3GbBCokJUmjErGg8kTJzdnYjNfvi3Z', // BORG
  'Grass7B4RdKfBCjTKgSqnXkqjwiGvQyFbuSCUJr3XXjs', // GRASS
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',  // mSOL
  'Bi11Je4MH3PpyCNiuTAepRbsA5U6DK3DJy79ZFthddX',  // BILL
  'MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey',  // MNDE
  'HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr', // EURC
  'SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3',  // SKR
  'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof',  // RENDER
  '98sMhvDwXj1RQi5c5Mndm3vPe9cBqPrbLaufMXFNMh5g', // HYPE
  'GzX1ireZDU865FiMaKrdVB1H6AE8LAqWYCg6chrMrfBw', // FRXUSD
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', // WIF
  'oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp',  // ORE
  'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux',  // HNT
  'USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX',  // USDH
  'FRySi8LPkuByB7VPSCCggxpewFUeeJiwEGRKKuhwpKcX', // NATIX
  'Dm5BxyMetG3Aq5PaG1BrG7rBYqEMtnkjvPNMExfacVk7', // ATH
  'u9nmK5sQovm6ACVCQbbq8xUMpFqdPSYxdxVwXUX4sjY',  // ORDI
  'DHsUQZYRqZ5WNEHZxL5evnAt7A7W19BJ5GxUdJz3NcPh', // USAD
  '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv', // PENGU
])
