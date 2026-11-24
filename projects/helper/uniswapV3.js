const { sumTokens2 } = require('./unwrapLPs')
const { getLogs } = require('./cache/getLogs')
const { cachedGraphQuery } = require('./cache')
const sdk = require('@defillama/sdk')
const { getCoreAssets } = require('./tokenMapping')

const uniswapConfig = {
  eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
  topics: ['0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118'],
}

const algebraConfig = {
  eventAbi: 'event Pool (address indexed token0, address indexed token1, address pool)',
  topics: ['0x91ccaa7a278130b65168c3a0c8d3bcae84cf5e43704342bd3ec0b59e59c036db'],
  // Integral 1.1 to 1.2.2 emit only this for custom-deployer pools, 1.2.3+ emit it next to Pool
  customPoolEventAbi: 'event CustomPool(address indexed deployer, address indexed token0, address indexed token1, address pool)',
}

// pool list from the clickhouse instead of the PoolCreated log cache, balances are still pulled on-chain
// for factories with 100k+ pools, where rewriting the log cache on every run takes longer than the run itself
const poolsSql = `
  SELECT DISTINCT
    concat('0x', substring(topic1, 27)) AS token0,
    concat('0x', substring(topic2, 27)) AS token1,
    concat('0x', substring(data, 91, 40)) AS pool
  FROM evm_indexer.logs
  PREWHERE chain = {chain:UInt64}
    AND short_address = {shortAddress:String}
    AND short_topic0 = {shortTopic0:String}
    AND block_number >= {fromBlock:UInt32}
    AND block_number <= {toBlock:UInt32}
    AND address = {factory:String}
    AND topic0 = {topic0:String}`

async function getPoolsFromIndexer(api, factory, fromBlock, topic0) {
  await api.getBlock()
  factory = factory.toLowerCase()
  return sdk.queryIndexerSql(poolsSql, {
    chain: api.chainId, factory, fromBlock, toBlock: api.block,
    shortAddress: factory.slice(0, 10), topic0, shortTopic0: topic0.slice(0, 10),
  })
}

// for factories flooded with launchpad pools (unpriced token against WETH/stable): read the quote side of every pool,
// and the other side only where the quote balance reaches minQuoteBalances[quoteToken] (raw units)
// the amounts only pick which pools get a second balance call, nothing is valued here
// pools where both tokens are core assets, or neither has a minimum, are always read in full
async function sumAboveQuoteMinimum({ api, logs, minQuoteBalances, blacklistedTokens, blacklistedOwners, ...sumOptions }) {
  const minimums = {}
  Object.entries(minQuoteBalances).forEach(([token, min]) => minimums[token.toLowerCase()] = BigInt(min))
  const coreAssets = new Set(getCoreAssets(api.chain))
  const skipTokens = new Set(blacklistedTokens.map(i => i.toLowerCase()))
  const skipOwners = new Set(blacklistedOwners.map(i => i.toLowerCase()))

  const ownerTokens = []
  const gated = []
  logs.forEach(({ token0, token1, pool }) => {
    if (skipOwners.has(pool.toLowerCase())) return
    const [t0, t1] = [token0.toLowerCase(), token1.toLowerCase()]
    const isGated = t => minimums[t] !== undefined && !skipTokens.has(t)
    const isKnown = t => minimums[t] !== undefined || coreAssets.has(t)
    if (isGated(t0) && !isKnown(t1)) gated.push({ quote: t0, other: t1, pool })
    else if (isGated(t1) && !isKnown(t0)) gated.push({ quote: t1, other: t0, pool })
    else ownerTokens.push([[token0, token1], pool])
  })

  const quoteBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: gated.map(i => ({ target: i.quote, params: i.pool })), permitFailure: true })
  gated.forEach(({ quote, other, pool }, i) => {
    const balance = quoteBalances[i]
    if (!balance) return
    api.add(quote, balance)
    if (BigInt(balance) >= minimums[quote]) ownerTokens.push([[other], pool])
  })
  sdk.log(`uniV3Export ${api.chain}: ${gated.length} pools gated on the quote side, ${ownerTokens.length} pools read in full`)

  return sumTokens2({ api, ownerTokens, blacklistedTokens, blacklistedOwners, ...sumOptions })
}

function uniV3Export(config) {
  const exports = {}

  Object.keys(config).forEach(chain => {
    let { factory: target, fromBlock, topics, eventAbi, isAlgebra, customPools, blacklistedTokens = [], blacklistedOwners = [], permitFailure, sumChunkSize, filterFn, sumChunkSleep, onlyUseExistingCache, extraKey, useIndexerSql, minQuoteBalances, } = config[chain]
    if (!topics) topics = isAlgebra ? algebraConfig.topics : uniswapConfig.topics
    if (!eventAbi) eventAbi = isAlgebra ? algebraConfig.eventAbi : uniswapConfig.eventAbi
    
    exports[chain] = {
      tvl: async (api) => {
        let logs
        // only for the uniswap PoolCreated layout, the algebra Pool event keeps the pool address elsewhere
        if (useIndexerSql && !isAlgebra) {
          if (sdk.isIndexerSqlEnabled())
            logs = await getPoolsFromIndexer(api, target, fromBlock, topics[0])
          else
            sdk.log(`uniV3Export ${chain}: indexer sql is not configured, falling back to getLogs`)
        }

        if (!logs) logs = await getLogs({
          api,
          target,
          topics,
          fromBlock,
          eventAbi,
          onlyUseExistingCache,
          onlyArgs: true,
          extraKey,
        })

        if (customPools) {
          const customLogs = await getLogs({
            api,
            target,
            fromBlock,
            eventAbi: algebraConfig.customPoolEventAbi,
            onlyUseExistingCache,
            onlyArgs: true,
            extraKey: extraKey ? `${extraKey}-custom-pool` : 'custom-pool',
          })
          const seen = new Set(logs.map(i => i.pool.toLowerCase()))
          logs = logs.concat(customLogs.filter(i => !seen.has(i.pool.toLowerCase())))
        }

        if (filterFn) 
          blacklistedTokens.push(... await filterFn(api, logs))
        

        if (minQuoteBalances)
          return sumAboveQuoteMinimum({ api, logs, minQuoteBalances, blacklistedTokens, blacklistedOwners, permitFailure: permitFailure ?? logs.length > 2000, sumChunkSize, sumChunkSleep, })

        return sumTokens2({ api, ownerTokens: logs.map(i => [[i.token0, i.token1], i.pool]), blacklistedTokens, blacklistedOwners, permitFailure: permitFailure ?? logs.length > 2000, sumChunkSize, sumChunkSleep, })
      }
    }
  })


  return exports
}

function uniV3GraphExport({ blacklistedTokens = [], graphURL, name, minTVLUSD = 0, poolName = 'pools'}) {
  return async (api) => {
    if (!name) throw new Error('name is required for uniV3GraphExport')
    const size = 1000
    // let lastId = ''
    // let pools

    const minTvlFilter = minTVLUSD ? `totalValueLockedUSD_gt: ${minTVLUSD}` : ''

    const graphQueryPagedWithBlock = `
    query poolQuery($lastId: String, $block: Int) {
      pools(block: { number: $block } first:${size} where: {id_gt: $lastId totalValueLockedUSD_gt: ${minTVLUSD}}) {
        id
        token0 { id }
        token1 { id }
      }
    }
  `
    const graphQueryPagedWithoutBlock = `
    query poolQuery($lastId: String) {
      ${poolName}(first:${size} where: {id_gt: $lastId ${minTvlFilter}}) {
        id
        token0 { id }
        token1 { id }
      }
    }
  `
    // const graphQueryPaged = api.block ? graphQueryPagedWithBlock : graphQueryPagedWithoutBlock
    const pools  = await cachedGraphQuery(name, graphURL, graphQueryPagedWithoutBlock, { api, useBlock: false, fetchById: true, })
    const ownerTokens = pools.map(i => [[i.token0.id, i.token1.id], i.id])
    await sumTokens2({ api, ownerTokens, blacklistedTokens })
  }
}


module.exports = {
  uniV3Export,
  uniV3GraphExport,
}
