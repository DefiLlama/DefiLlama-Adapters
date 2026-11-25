const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { addUniV4PoolReserves } = require('../helper/uniswapV4')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConnection } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

// QHooks (https://qhooks.com) launches tokens into Uniswap v4 pools whose hook is the QHooks launch contract itself.
// Each launch contract (QSimpleLaunch generations, and QSaleLaunch for sale-first launches) emits one event per pool.
const QHOOKS = '0x20429af7ca3b0ce4d99edbaa0693f26c5df05195' // protocol token, Robinhood Chain only
const STAKE_VAULT = '0x6248098bfa019b9035a21722a86bdee3f6e9b934' // QHOOKS staking (the timed QStakeLock deposits into it)
const SALE = '0x707d79c32bea8f9773a81569fbacc64ab0502044' // QSaleLaunch, same address on every EVM chain

// Solana launches use one Meteora Dynamic Bonding Curve config. Migrated pools
// are excluded because their liquidity is counted by Meteora DAMM v2.
const DBC_PROGRAM = new PublicKey('dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN')
const QHOOKS_DBC_CONFIG = 'AFBWuEXpP78Sgk6BZuHc2eHNJKdabFwrGk57kscvurmd'
const VIRTUAL_POOL_DISC = 'cmrfVvtHrjd'
const VIRTUAL_POOL_CONFIG_OFFSET = 72
const VIRTUAL_POOL_QUOTE_RESERVE_OFFSET = 240
const VIRTUAL_POOL_MIGRATED_OFFSET = 305
const NOT_MIGRATED = '1' // base58 encoding of a zero byte

const launchedAbi = 'event Launched(bytes32 indexed poolId, address indexed token, address indexed creator, address quote, string name, string symbol, string meta, uint8 style, address blocks, int24 startTick, int24 targetTick, uint256 supply, uint24 fee)'
const settledAbi = 'event Settled(uint256 indexed saleId, address indexed token, bytes32 indexed poolId, uint256 clearPrice, uint256 raised, uint256 sold, uint256 poolTokens)'
const initializeAbi = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)'
const INITIALIZE_TOPIC = '0xdd466e674ea557f56295e2d0218a125ea4b4f0f6f3307b95f85e6110838d6438'

// fromBlock = the launch contract's deploy block or an earlier one; sale = lower bound for QSaleLaunch on that chain
const config = {
  robinhood: {
    poolManager: '0x8366a39cc670b4001a1121b8f6a443a643e40951', stateView: '0xf3334192d15450cdd385c8b70e03f9a6bd9e673b', sale: 110156527,
    launches: [
      ['0x023623568f41c032ec2f4bba368dbafc123160cc', 108170556],
      ['0xfb5a559886fccba6400cc52905ba3aa4658ba0cc', 110156527],
      ['0x34ac8c4e6ca3d5b70a5321b648d0db9451c060cc', 110390517],
      ['0xefe39a5632212911fe8e3ddcb07f08e5e220e0cc', 110831000],
      ['0x3fcf7693f799da31134970787f9f35578d0f60cc', 111223856],
    ],
  },
  base: {
    poolManager: '0x498581ff718922c3f8e6a244956af099b2652b2b', stateView: '0xa3c0c9b65bad0b08107aa264b0f3db444b867a71', sale: 55185578,
    launches: [
      ['0xfb5a559886fccba6400cc52905ba3aa4658ba0cc', 55185578],
      ['0x34ac8c4e6ca3d5b70a5321b648d0db9451c060cc', 55351284],
      ['0x3fcf7693f799da31134970787f9f35578d0f60cc', 55793671],
    ],
  },
  arbitrum: {
    poolManager: '0x360e68faccca8ca495c1b759fd9eee466db9fb32', stateView: '0x76fd297e2d437cd7f76d50f01afe6160f86e9990', sale: 522677810,
    launches: [
      ['0xfb5a559886fccba6400cc52905ba3aa4658ba0cc', 522677810],
      ['0x34ac8c4e6ca3d5b70a5321b648d0db9451c060cc', 522799540],
      ['0x3fcf7693f799da31134970787f9f35578d0f60cc', 523106870],
    ],
  },
  bsc: {
    poolManager: '0x28e2ea090877bf75740558f6bfb36a5ffee9e9df', stateView: '0xd13dd3d6e93f276fafc9db9e6bb47c1180aee0c4', sale: 132585433,
    launches: [
      ['0xfb5a559886fccba6400cc52905ba3aa4658ba0cc', 132585433],
      ['0x34ac8c4e6ca3d5b70a5321b648d0db9451c060cc', 132660352],
      ['0x3fcf7693f799da31134970787f9f35578d0f60cc', 132855010],
    ],
  },
  ethereum: {
    poolManager: '0x000000000004444c5dc75cb358380d2e3de08a90', stateView: '0x7ffe42c4a5deea5b0fec41c94c136cf115597227', sale: 26380174,
    launches: [
      ['0x34ac8c4e6ca3d5b70a5321b648d0db9451c060cc', 26380174],
      ['0x3fcf7693f799da31134970787f9f35578d0f60cc', 26387450],
    ],
  },
  elysium: {
    poolManager: '0xe2e105d3f7209a9da11f83ccf3e7398a753823f1', stateView: '0x27ed73ae0652fdcf71d6793412a7525f32be9dfe', sale: 3239822,
    launches: [
      ['0x8223f9ce8998fb436fc32bdf541cc34d668420cc', 3239822],
      ['0xc7faaf2e1b01e5e2cae4f967a020b49b290ca0cc', 3539046],
      ['0x9a9d37bca2e9874a1da1a1bab51f242a9d1ca0cc', 4331176],
    ],
  },
  monad: {
    poolManager: '0x188d586ddcf52439676ca21a244753fa19f9ea8e', stateView: '0x77395f3b2e73ae90843717371294fa97cc419d64',
    launches: [
      ['0x0f73962ed759b0abdb92cbecbc3ef2bf462a20cc', 121245205],
    ],
  },
}

// Every QHooks pool: one Launched per pool from each launch contract, plus pools opened when a sale settles.
async function registrations(api) {
  const { launches, sale } = config[api.chain]
  const regs = []
  for (const [target, fromBlock] of launches) {
    const logs = await getLogs2({ api, target, eventAbi: launchedAbi, fromBlock, onlyArgs: false, extraKey: 'qhooks-launched' })
    logs.forEach((l) => regs.push({ id: l.args.poolId.toLowerCase(), token: l.args.token.toLowerCase(), hook: target, block: l.blockNumber }))
  }
  if (sale) {
    const logs = await getLogs2({ api, target: SALE, eventAbi: settledAbi, fromBlock: sale, onlyArgs: false, extraKey: 'qhooks-settled' })
    logs.forEach((l) => regs.push({ id: l.args.poolId.toLowerCase(), token: l.args.token.toLowerCase(), hook: SALE, block: l.blockNumber }))
  }
  return regs
}

// The pool key comes from the PoolManager Initialize emitted in the same tx as each registration.
async function discoverPools(api) {
  const { poolManager } = config[api.chain]
  const byId = new Map()
  for (const r of await registrations(api)) if (!byId.has(r.id)) byId.set(r.id, r)
  const regs = [...byId.values()], pools = []
  for (let i = 0; i < regs.length; i += 10) {
    await Promise.all(regs.slice(i, i + 10).map(async (r) => {
      const [log] = await getLogs2({ api, target: poolManager, eventAbi: initializeAbi, topics: [INITIALIZE_TOPIC, r.id], fromBlock: r.block, toBlock: r.block + 1, skipCache: true, useIndexer: false })
      if (!log || log.hooks.toLowerCase() !== r.hook) throw new Error(`QHooks: no Initialize with the QHooks hook for ${r.id}`)
      pools.push({ id: log.id, token0: log.currency0, token1: log.currency1, spacing: Number(log.tickSpacing) })
    }))
  }
  if (pools.length !== byId.size) throw new Error(`QHooks: ${byId.size} pools registered but ${pools.length} Initialize events`)
  return pools
}

const quoteAssets = (chain) => new Set([ADDRESSES.null, ...Object.values(ADDRESSES[chain] ?? {})].map((a) => a.toLowerCase()))
const cache = {}

// Reserves of every QHooks pool by token, shared by tvl and staking.
async function poolBalances(api) {
  const key = `${api.chain}-${api.block}`
  if (!cache[key]) cache[key] = (async () => {
    const pools = await discoverPools(api)
    const balances = {}
    const recorder = { multiCall: (...args) => api.multiCall(...args), add: (token, amount) => { token = token.toLowerCase(); balances[token] = (balances[token] ?? 0) + Number(amount) } }
    await addUniV4PoolReserves({ api: recorder, pools, stateView: config[api.chain].stateView })
    return balances
  })()
  return cache[key]
}

async function tvl(api) {
  await api.getBlock()
  const quotes = quoteAssets(api.chain)
  const balances = await poolBalances(api)
  // quote side only: launched tokens are not counted, QHOOKS goes to staking
  Object.entries(balances).forEach(([token, amount]) => { if (token !== QHOOKS && quotes.has(token)) api.add(token, amount) })
  // quote assets committed to sales that have not settled yet (held by QSaleLaunch)
  // sUSD_OLD is an ethereum core asset whose balanceOf reverts
  if (config[api.chain].sale) await sumTokens2({ api, owner: SALE, tokens: [...quotes].filter((t) => t !== QHOOKS), blacklistedTokens: [ADDRESSES.ethereum.sUSD_OLD] })
}

async function staking(api) {
  await api.getBlock()
  const balances = await poolBalances(api)
  if (balances[QHOOKS]) api.add(QHOOKS, balances[QHOOKS])
  return sumTokens2({ api, owner: STAKE_VAULT, tokens: [QHOOKS] })
}

async function solanaTvl(api) {
  const connection = getConnection()
  const config = await connection.getAccountInfo(new PublicKey(QHOOKS_DBC_CONFIG))
  if (!config) throw new Error(`QHooks: DBC config ${QHOOKS_DBC_CONFIG} not found`)
  const quoteMint = new PublicKey(config.data.subarray(8, 40)).toBase58()
  const pools = await connection.getProgramAccounts(DBC_PROGRAM, {
    filters: [
      { memcmp: { offset: 0, bytes: VIRTUAL_POOL_DISC } },
      { memcmp: { offset: VIRTUAL_POOL_CONFIG_OFFSET, bytes: QHOOKS_DBC_CONFIG } },
      { memcmp: { offset: VIRTUAL_POOL_MIGRATED_OFFSET, bytes: NOT_MIGRATED } },
    ],
    dataSlice: { offset: VIRTUAL_POOL_QUOTE_RESERVE_OFFSET, length: 8 },
  })
  // Each VirtualPool reserve is one quote vault balance; add it once.
  for (const { account: { data } } of pools) api.add(quoteMint, data.readBigUInt64LE(0).toString())
}

module.exports = {
  doublecounted: true, // QHooks pools are Uniswap v4 pools, also counted by the uniswap-v4 adapter
  methodology:
    'TVL is the quote-asset side (native coin, WETH, stablecoins and other core assets) of the liquidity in QHooks launch pools: ' +
    'Uniswap v4 pools whose hook is a QHooks launch contract, found from the launch contracts\' Launched and Settled events, plus quote ' +
    'assets committed to QHooks sales that have not settled. Launched tokens are not counted. QHOOKS was launched through QHooks, so the ' +
    'WETH side of its QHOOKS/WETH pool counts as TVL like any other launch. Staking is QHOOKS staked in the QHooks stake vault plus the ' +
    'QHOOKS held in QHooks pools. On Solana, TVL is the quote reserve in non-migrated Meteora DBC pools created under the QHooks config; ' +
    'graduated pools move to DAMM v2 and are counted by the Meteora adapter, as with other DBC launchpads.',
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})
module.exports.robinhood = { tvl, staking }
module.exports.solana = { tvl: solanaTvl }
