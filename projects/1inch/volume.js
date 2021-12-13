const { getCurrentBlocks } = require('@defillama/sdk/build/computeTVL/blocks')
const { getChainVolume } = require('../helper/getUniSubgraphVolume')
const { endpoint } = require('./api')

const graphs = getChainVolume({
  graphUrls: {
    ethereum: endpoint,
  },
  factoriesName: 'mooniswapFactories',
})

module.exports = {
  volumes: {
    ethereum: graphs('ethereum'),
  },
  isAggregator: true,
}
