const { getCurrentBlocks } = require('@defillama/sdk/build/computeTVL/blocks')
const {
  getChainVolume,
  DEFAULT_TOTAL_VOLUME_FIELD,
  DEFAULT_DAILY_VOLUME_FIELD,
} = require('../helper/getUniSubgraphVolume')
const { endpoint } = require('./api')

const graphs = getChainVolume({
  graphUrls: {
    ethereum: endpoint,
  },
  totalVolume: {
    factory: 'mooniswapFactories',
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: 'mooniswapDayData',
    field: DEFAULT_DAILY_VOLUME_FIELD,
  },
})

module.exports = {
  volumes: {
    ethereum: graphs('ethereum'),
  },
  isAggregator: true,
}
