const { sumTokens2 } = require('./unwrapLPs')
const { getLogs } = require('./cache/getLogs')

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
    let { factory: target, fromBlock, topics, eventAbi, isAlgebra } = config[chain]
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

        return sumTokens2({ api, ownerTokens: logs.map(i => [[i.token0, i.token1], i.pool]), })
      }
    }
  })


  return exports
}

module.exports = {
  uniV3Export,
};
