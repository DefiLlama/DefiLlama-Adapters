const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  bitkub: {
    factory: '0xD679d310008A2595B8d3DeB83bb93EB23F9b0942',
    fromBlock: 31936260,
    positionManager: '0xA8fa5d2774f850Fba2bC572e38b1dB340233e837',
  },
})

module.exports.timetravel = true
module.exports.misrepresentedTokens = false
module.exports.methodology = 'TVL is calculated by summing the reserves of all Kublerx V3 pools on KUB. Pools are discovered from PoolCreated events emitted by the V3 factory.'