const { onChainTvl } = require('../helper/balancer')

const V2_ADDRESS = '0xBE09E71BDc7b8a50A05F7291920590505e3C7744'; // shared by all networks

const config = {
  berachain: { fromBlock: 1, },
}

Object.keys(config).forEach(chain => {
  const { fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: onChainTvl(V2_ADDRESS, fromBlock)
  }
})
