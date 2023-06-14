const { unwrapUniswapV3NFTs } = require('../helper/unwrapLPs')

const config = {
  polygon: {
    owners: ['0x8c696deF6Db3104DF72F7843730784460795659a']
  }
}

module.exports = {
  doublecounted: true
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: (_, _b, { [chain]: block }) => {
      const { owners } = config[chain]
      return unwrapUniswapV3NFTs({ chain, block, owners, })
    }
  }
})