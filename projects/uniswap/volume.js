const { getCurrentBlocks } = require('@defillama/sdk/build/computeTVL/blocks')
const { getChainVolume } = require('../helper/getUniSubgraphVolume')
const { v1, v2, v3 } = require('./api')

const v1graph = getChainVolume({
  graphUrls: {
    ethereum: v1,
  },
})

const v2graph = getChainVolume({
  graphUrls: {
    ethereum: v2,
  },
})

const v3Graphs = getChainVolume({
  graphUrls: v3,
  factoriesName: 'factories',
})

module.exports = {
  breakdown: {
    v1: {
      ethereum: v1graph('ethereum'),
    },
    v2: {
      ethereum: v2graph('ethereum'),
    },
    v3: {
      ethereum: v3Graphs('ethereum'),
      arbitrum: v3Graphs('arbitrum'),
    },
  },
}
