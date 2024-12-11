const { onChainTvl } = require('../helper/balancer')

const V3_ADDRESS = '0xbA1333333333a1BA1108E8412f11850A5C319bA9';

const config = {
  ethereum: { fromBlock: 21332121, },
  xdai: { fromBlock: 37360338, }
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: onChainTvl(V3_ADDRESS, fromBlock)
  }
})
