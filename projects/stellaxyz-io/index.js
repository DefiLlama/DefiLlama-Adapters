const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs');

// lending proxy => deploy block
const proxies = {
  '0xfff45c0b77d7c0c33a97a879576f0550b6842bff': 101291653,
  '0x032ba65c71c82d2e6dcf91cad148adc64a5f02a7': 131951206,
}

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

async function getStrategies(api) {
  const all = []
  for (const [factory, fromBlock] of Object.entries(factories)) {
    const logs = await getLogs({ api, target: factory, eventAbi: createStrategyAbi, fromBlock, onlyArgs: true })
    all.push(...logs.map(log => log[1])) // strategy proxy
  }
  return [...new Set(all)]
}

async function getPools(api) {
  const pools = []
  for (const [proxy, fromBlock] of Object.entries(proxies)) {
    const adds = await getLogs({ api, target: proxy, eventAbi: addPoolAbi, fromBlock, onlyArgs: true, extraKey: 'add-pool' })
    const delists = await getLogs({ api, target: proxy, eventAbi: delistPoolAbi, fromBlock, onlyArgs: true, extraKey: 'delist-pool' })
    const delisted = new Set(delists.map(log => log[0].toLowerCase()))
    pools.push(...adds.map(log => log[0]).filter(pool => !delisted.has(pool.toLowerCase())))
  }
  return [...new Set(pools)]
}

module.exports = {
  methodology: 'Counts deposit-token balances held by Stella lending pools (AddLendingPool events on both lending proxies, delisted pools excluded), plus tokens and Uniswap V3 positions held by strategy position managers.',
  arbitrum: {
    tvl: async (api) => {
      const strategies = await getStrategies(api)
      const positionManagers = await api.multiCall({ abi: 'address:positionManager', calls: strategies })

      const pools = await getPools(api)
      const tokens = await api.multiCall({ abi: 'address:depositToken', calls: pools })
      await sumTokens2({ api, tokensAndOwners2: [tokens, pools] })

      const pmTokenPairs = []
      for (const pm of positionManagers) for (const token of tokens) pmTokenPairs.push([token, pm])
      await sumTokens2({ api, tokensAndOwners: pmTokenPairs, owners: positionManagers, resolveUniV3: true })
    }
  },
}
