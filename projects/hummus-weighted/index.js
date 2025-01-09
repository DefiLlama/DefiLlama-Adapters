const { onChainTvl } = require('../helper/balancer')

module.exports = {
  metis: {
    tvl: onChainTvl('0x95B4F64c2a96F770C1b4216e18ED692C01506437', 7066703),
  }
}
