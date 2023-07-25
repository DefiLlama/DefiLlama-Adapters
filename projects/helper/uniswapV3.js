const { sumTokens2 } = require('./unwrapLPs')
const { getLogs } = require('./cache/getLogs')
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
    let { factory: target, fromBlock, topics, eventAbi, isAlgebra, blacklistedTokens = [] } = config[chain]
    if (!topics) topics = isAlgebra ? algebraConfig.topics : uniswapConfig.topics
    if (!eventAbi) eventAbi = isAlgebra ? algebraConfig.eventAbi : uniswapConfig.eventAbi

    exports[chain] = {
      tvl: async (_, _b, _cb, { api, }) => {
        const logs = await getLogs({
          api,
          target,
          topics,
          fromBlock,
          eventAbi,
          onlyArgs: true,
        })

        return sumTokens2({ api, ownerTokens: logs.map(i => [[i.token0, i.token1], i.pool]), blacklistedTokens, permitFailure: logs.length > 5000 })
      }
    }
  })


  return exports
}

function uniV3GraphExport({ blacklistedTokens = [], graphURL }) {
  return async (_, _b, _cb, { api }) => {
    const size = 1000
    let lastId = ''
    let pools

    const graphQueryPagedWithBlock = `
    query poolQuery($lastId: String, $block: Int) {
      pools(block: { number: $block } first:${size} where: {id_gt: $lastId totalValueLockedUSD_gt: 100}) {
        id
        token0 { id }
        token1 { id }
      }
    }
  `
    const graphQueryPagedWithoutBlock = `
    query poolQuery($lastId: String) {
      pools(first:${size} where: {id_gt: $lastId totalValueLockedUSD_gt: 100}) {
        id
        token0 { id }
        token1 { id }
      }
    }
  `
    const graphQueryPaged = api.block ? graphQueryPagedWithBlock : graphQueryPagedWithoutBlock

    do {
      const params = { lastId, block: api.block }
      const res = await request(graphURL, graphQueryPaged, params);
      pools = res.pools
      const tokensAndOwners = pools.map(i => ([[i.token0.id, i.id], [i.token1.id, i.id]])).flat()
      await sumTokens2({ api, tokensAndOwners, blacklistedTokens })
      lastId = pools[pools.length - 1]?.id
    } while (pools.length === size)
  }
}


module.exports = {
  uniV3Export,
  uniV3GraphExport,
}
