const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs');

// The official Stella subgraph (graph.stellaxyz.io) died around 2026-06-10,
// freezing the feed. Everything below is discovered on-chain instead:
// strategies via factory CreateStrategy events, lending pools via
// AddLendingPool events on the two lending proxies.
// The proxies are hardcoded: they are set once on the lending-proxy-aggregator
// (0x2A1633A2F879b2a41650a48C42c14001E5607055, verified on-chain 2026-10-07)
// and the protocol is abandoned (no team activity since 2024), so the set is
// frozen. Pools stay event-discovered since that scan works reliably.
const proxies = [
  '0xfff45c0b77d7c0c33a97a879576f0550b6842bff',
  '0x032ba65c71c82d2e6dcf91cad148adc64a5f02a7',
]

const factories = {
  '0x573a89fbc6b4a5b11a55dc9814a1018a3a9cd0ca': 101291920, // UniV3StrategyFactory
  '0x811A3f2577DE04Af01663Df8DcF543bF6a6187B2': 111000000, // JoeV2StrategyFactory
  '0x6A5fB411e85D74b51862DED8d1cF54f1896d95bE': 131000000, // PendleLSDStrategyFactory
  '0xbb5A4dCb173f643Ca6687aA837d6357DF9d6C936': 131000000, // PenpieLSDStrategyFactory
  '0xE3d6f0D0b487B102C4eCFa5c1Cc27774ED227B7b': 161000000, // CamelotV3StrategyFactory
}

const createStrategyAbi = 'event CreateStrategy(address,address)'
const addPoolAbi = 'event AddLendingPool(address)'
const delistPoolAbi = 'event DelistLendingPool(address)'
const poolsFromBlock = 131951268 // aggregator deployment, covers all pool history

async function getStrategies(api) {
  const all = []
  for (const [factory, fromBlock] of Object.entries(factories)) {
    const logs = await getLogs({ api, target: factory, eventAbi: createStrategyAbi, fromBlock, onlyArgs: true })
    // data = (poolOrMarket, strategyProxy); the proxy (2nd field) is what holds positions
    all.push(...logs.map(log => log[1]))
  }
  return [...new Set(all)]
}

async function getPools(api) {
  const pools = []
  for (const proxy of proxies) {
    // extraKey: the log cache is keyed by chain+target, so the add and delist
    // scans on the same proxy need distinct keys or they read each other's logs
    const adds = await getLogs({ api, target: proxy, eventAbi: addPoolAbi, fromBlock: poolsFromBlock, onlyArgs: true, extraKey: 'add-pool' })
    const delists = await getLogs({ api, target: proxy, eventAbi: delistPoolAbi, fromBlock: poolsFromBlock, onlyArgs: true, extraKey: 'delist-pool' })
    const delisted = new Set(delists.map(log => log[0].toLowerCase()))
    pools.push(...adds.map(log => log[0]).filter(pool => !delisted.has(pool.toLowerCase())))
  }
  return [...new Set(pools)]
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'Counts deposit-token balances held by all on-chain Stella lending pools plus token and Uniswap-V3 NFT positions held by strategy position managers. Discovered via factory and lending-proxy events; no subgraph dependency.',
  arbitrum: {
    tvl: async (api) => {
      const strategies = await getStrategies(api)
      // no permitFailure: a failed lookup must error loudly, never silently
      // drop a strategy's holdings from the total
      const positionManagers = await api.multiCall({ abi: 'address:positionManager', calls: strategies })

      const pools = await getPools(api)
      const tokens = await api.multiCall({ abi: 'address:depositToken', calls: pools })
      await sumTokens2({ api, tokensAndOwners2: [tokens, pools] })

      // Deposit tokens possibly parked in position managers (cross product).
      // PM-held AMM positions beyond canonical UniV3 NFTs (Camelot NPM, JoeV2
      // LB, Pendle PTs) are not resolvable by the helpers; verified worth ~$0
      // (test total reconciles to pool balances), so they are out of scope.
      const pmTokenPairs = []
      for (const pm of positionManagers) for (const token of tokens) pmTokenPairs.push([token, pm])
      await sumTokens2({ api, tokensAndOwners: pmTokenPairs, owners: positionManagers, resolveUniV3: true })
    }
  },
}
