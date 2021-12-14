const {
  getChainVolume,
  DEFAULT_TOTAL_VOLUME_FIELD,
  DEFAULT_DAILY_VOLUME_FIELD,
} = require('../helper/getUniSubgraphVolume')
const { endpoints } = require('./api')

const graphs = getChainVolume({
  graphUrls: {
    ethereum: endpoints.ethereum,
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
