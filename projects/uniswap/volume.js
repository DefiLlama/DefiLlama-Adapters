const {
  getChainVolume,
  DEFAULT_DAILY_VOLUME_FACTORY,
  DEFAULT_TOTAL_VOLUME_FIELD,
} = require('../helper/getUniSubgraphVolume')
const { endpoint } = require('./api')

const v1Graph = getChainVolume({
  graphUrls: {
    ethereum: endpoint.v1,
  },
  totalVolume: {
    factory: 'uniswaps',
    field: 'totalVolumeUSD',
  },
  dailyVolume: {
    factory: DEFAULT_DAILY_VOLUME_FACTORY,
    field: 'dailyVolumeInUSD',
  },
})

const v2Graph = getChainVolume({
  graphUrls: {
    ethereum: endpoint.v2,
  },
})

const v3Graphs = getChainVolume({
  graphUrls: { ...endpoint.v3, ethereum: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3' },
  totalVolume: {
    factory: 'factories',
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: DEFAULT_DAILY_VOLUME_FACTORY,
    field: 'volumeUSD',
  },
})

module.exports = {
  breakdown: {
    v1: {
      ethereum: v1Graph('ethereum'),
    },
    v2: {
      ethereum: v2Graph('ethereum'),
    },
    v3: {
      ethereum: v3Graphs('ethereum'),
      // Will have to replace with faster indexer
      arbitrum: v3Graphs('arbitrum'),
    },
  },
}
