const { sumTokens2 } = require('./unwrapLPs')
const { getLogs } = require('./cache/getLogs')
const { cachedGraphQuery } = require('./cache')
const { request, } = require('graphql-request')

const uniswapConfig = {
  eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
  topics: ['0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118'],
}

const algebraConfig = {
  eventAbi: 'event Pool (address indexed token0, address indexed token1, address pool)',
  topics: ['0x91ccaa7a278130b65168c3a0c8d3bcae84cf5e43704342bd3ec0b59e59c036db'],
}

function uniV3Export(config) {
  const exports = {}

  Object.keys(config).forEach(chain => {
    let { factory: target, fromBlock, topics, eventAbi, isAlgebra, blacklistedTokens = [], permitFailure, sumChunkSize, filterFn, } = config[chain]
    if (!topics) topics = isAlgebra ? algebraConfig.topics : uniswapConfig.topics
    if (!eventAbi) eventAbi = isAlgebra ? algebraConfig.eventAbi : uniswapConfig.eventAbi

    exports[chain] = {
      tvl: async (api) => {
        const logs = await getLogs({
          api,
          target,
          topics,
          fromBlock,
          eventAbi,
          onlyArgs: true,
        })

        if (filterFn) 
          blacklistedTokens.push(... await filterFn(api, logs))
        

        return sumTokens2({ api, ownerTokens: logs.map(i => [[i.token0, i.token1], i.pool]), blacklistedTokens, permitFailure: permitFailure || logs.length > 2000, sumChunkSize, })
      }
    }
  })


  return exports
}

function uniV3GraphExport({ blacklistedTokens = [], graphURL, name, minTVLUSD = 10,}) {
  return async (api) => {
    const size = 1000
    // let lastId = ''
    // let pools

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
      pools(first:${size} where: {id_gt: $lastId totalValueLockedUSD_gt:  ${minTVLUSD}}) {
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
