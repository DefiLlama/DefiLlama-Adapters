const { onChainTvl } = require('../helper/balancer')

const V2_ADDRESS = '0x4Be03f781C497A489E3cB0287833452cA9B9E80B'; // shared by all networks

const config = {
  berachain: { fromBlock: 9384, },
}

Object.keys(config).forEach(chain => {
  const { fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: onChainTvl(V2_ADDRESS, fromBlock)
  }
})
