const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { addUniV4PoolReserves, chainConfig } = require('../helper/uniswapV4')

// https://hookr.fun/docs/reference/contracts-and-addresses · https://hookr.fun/docs/previous-releases
const HOOKR = '0x18e674231a58c239dc7daedcffe15ec3a24cff5c'
const registry = '0x463c82bea1a52f4cc05ca0741a24f0ad24ba4602'
const root = '0x89c9fb50d1f03192230ffb1c279bb6e7d3fe6acc'
const treasury = '0x2242f7fc75606500503075f29ea8cda684efb4a9'
const modularRegistry = '0x5b7f1a117a83aaac15b0698aa4eb9d53fe5f5ba3'
const modularKernels = [
  '0xb3ca29cf721380cee8b8e4755f3865ebc68fe8cc',
  '0xb914f955294799de4b891bd2ea8af628fa1c68cc',
  '0xc7c516cd5546bcb2592fe3f8aa91c2a4ba3768cc',
  '0xa99902a2922014bbe2bf2dcf15742ac5104828cc',
  '0xe5429db8f63912e632e86733905667aaeb6ea8cc',
]
const launchFields = '(address indexed token,bytes32 indexed poolId,uint160 sqrtPriceX96,uint256 ethLiquidity,uint256 tokenLiquidity,uint256 tokensBurned)'
const launchpads = [
  { target: '0xaaed6fab06d53311220f35421dda5cc6d6e9d6c3', fromBlock: 27763919, eventAbi: `event Graduated${launchFields}` },
  { target: '0x5ce779d23d2e99d322004f203813389b6a426e3b', fromBlock: 33485079, eventAbi: `event Graduated${launchFields}` },
  { target: '0xa043cabe645636899dde91cce4693c00a015e660', fromBlock: 41850162, eventAbi: `event Migrated${launchFields}` },
]
const rootEvents = [
  'event RootRegistered(address indexed root)',
  'event FactoryRootRegistered(address indexed factory,address indexed root)',
  'event OwnedRootRegistered(address indexed root,address indexed factory,address indexed template,address rules)',
]
const poolOpenedAbi = 'event PoolOpened(bytes32 indexed id,address indexed launcher,bytes32 indexed policyHash,address rules,address advisory)'
const stackInitializedAbi = 'event StackInitialized(bytes32 indexed poolId,bytes32 indexed stackHash,address indexed kernel)'
const initializeAbi = 'event Initialize(bytes32 indexed id,address indexed currency0,address indexed currency1,uint24 fee,int24 tickSpacing,address hooks,uint160 sqrtPriceX96,int24 tick)'
const INITIALIZE_TOPIC = '0xdd466e674ea557f56295e2d0218a125ea4b4f0f6f3307b95f85e6110838d6438'

const eventName = (abi) => abi.match(/event (\w+)/)[1]

async function registrations(api) {
  const regs = []
  for (const { target, fromBlock, eventAbi } of launchpads) {
    const logs = await getLogs2({ api, target, eventAbi, fromBlock, onlyArgs: false, extraKey: `hookr-${eventName(eventAbi)}` })
    logs.forEach((l) => regs.push({ id: l.args.poolId.toLowerCase(), block: l.blockNumber }))
  }

  const roots = new Set([root])
  for (const eventAbi of rootEvents) {
    const logs = await getLogs2({ api, target: registry, eventAbi, fromBlock: 82269732, extraKey: `hookr-${eventName(eventAbi)}` })
    logs.forEach((l) => roots.add(l.root.toLowerCase()))
  }
  const opened = []
  for (const hook of roots) {
    const logs = await getLogs2({ api, target: hook, eventAbi: poolOpenedAbi, fromBlock: 82270270, onlyArgs: false, extraKey: 'hookr-PoolOpened' })
    logs.forEach((l) => opened.push({ id: l.args.id.toLowerCase(), block: l.blockNumber, hook, rules: l.args.rules.toLowerCase() }))
  }
  // only pools whose Rules pay Hookr's treasury, not independent roots running the same software
  const rules = [...new Set(opened.map((p) => p.rules))]
  const recipients = rules.length ? await api.multiCall({ abi: 'address:protocolRecipient', calls: rules }) : []
  const admitted = new Set(rules.filter((_, i) => recipients[i].toLowerCase() === treasury))
  opened.filter((p) => admitted.has(p.rules)).forEach(({ id, block, hook }) => regs.push({ id, block, hook }))

  const stacks = await getLogs2({ api, target: modularRegistry, eventAbi: stackInitializedAbi, fromBlock: 57319489, onlyArgs: false })
  stacks
    .filter((l) => modularKernels.includes(l.args.kernel.toLowerCase()))
    .forEach((l) => regs.push({ id: l.args.poolId.toLowerCase(), block: l.blockNumber, hook: l.args.kernel.toLowerCase() }))
  return regs
}

async function discoverPools(api) {
  const byId = new Map()
  for (const reg of await registrations(api)) {
    const prev = byId.get(reg.id)
    if (prev && (prev.block !== reg.block || (prev.hook && reg.hook && prev.hook !== reg.hook)))
      throw new Error(`Hookr: conflicting registration for ${reg.id}`)
    byId.set(reg.id, { ...prev, ...reg })
  }
  // each registration is emitted in the same block as its PoolManager Initialize, so read that one block by pool id
  const { poolManager } = chainConfig[api.chain]
  const regs = [...byId.values()]
  const pools = new Map()
  for (let i = 0; i < regs.length; i += 10) {
    await Promise.all(regs.slice(i, i + 10).map(async ({ id, block, hook }) => {
      // skipCache: the PoolManager key is shared with uniswap-v4's unfiltered Initialize cache
      const [log] = await getLogs2({ api, target: poolManager, eventAbi: initializeAbi, topics: [INITIALIZE_TOPIC, id], fromBlock: block, toBlock: block + 1, skipCache: true, useIndexer: false })
      if (!log || (hook && hook !== log.hooks.toLowerCase())) throw new Error(`Hookr: Initialize does not match registration for ${id}`)
      pools.set(id, { id: log.id, token0: log.currency0, token1: log.currency1, spacing: Number(log.tickSpacing) })
    }))
  }
  if (pools.size !== byId.size) throw new Error(`Hookr: ${byId.size} registered pools but ${pools.size} Initialize events`)
  return [...pools.values()]
}

// quote assets only: launched tokens are excluded, HOOKR (the protocol token) goes to staking
const quotes = new Set([ADDRESSES.null, ...Object.values(ADDRESSES.robinhood)].map((a) => a.toLowerCase()))
const reserves = {}

async function poolBalances(api) {
  const key = `${api.chain}-${api.block}`
  if (!reserves[key]) reserves[key] = (async () => {
    const pools = await discoverPools(api)
    const balances = {}
    const recorder = { multiCall: (...args) => api.multiCall(...args), add: (token, amount) => { token = token.toLowerCase(); balances[token] = (balances[token] ?? 0) + Number(amount) } }
    await addUniV4PoolReserves({ api: recorder, pools, stateView: chainConfig[api.chain].stateView })
    return balances
  })()
  return reserves[key]
}

async function tvl(api) {
  await api.getBlock()
  const balances = await poolBalances(api)
  Object.entries(balances).forEach(([token, amount]) => { if (token !== HOOKR && quotes.has(token)) api.add(token, amount) })
}

async function staking(api) {
  await api.getBlock()
  const balances = await poolBalances(api)
  if (balances[HOOKR]) api.add(HOOKR, balances[HOOKR])
}

module.exports = {
  start: '2026-08-04',
  doublecounted: true,
  methodology: 'Counts the quote-asset side (ETH, USDG and other Robinhood core assets) of the liquidity in Hookr Uniswap V4 pools across the legacy launchpads, modular kernels and current roots, including third-party LP positions. Hookr-launched tokens are excluded. HOOKR held in these pools is counted under staking. Accrued fees, pre-pool curves and auctions, tokenizer backing and treasury or burn-jar balances are excluded. Pools overlap Uniswap V4 TVL.',
  robinhood: { tvl, staking },
}
