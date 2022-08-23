const {tokenHolderBalances} = require('../helper/tokenholders')

const { ethereum, bsc, polygon, optimism, arbitrum, xdai, avax } = require('./config.js')

module.exports={
  ethereum: {
    tvl: tokenHolderBalances(ethereum)
  },
  bsc: {
    tvl: tokenHolderBalances(bsc, 'bsc')
  },
  polygon: {
    tvl: tokenHolderBalances(polygon, 'polygon')
  },
  optimism: {
    tvl: tokenHolderBalances(optimism, 'optimism')
  },
  arbitrum: {
    tvl: tokenHolderBalances(arbitrum, 'arbitrum')
  },
  xdai: {
    tvl: tokenHolderBalances(xdai, 'xdai')
  },
  avax: {
    tvl: tokenHolderBalances(avax, 'avax')
  },
}