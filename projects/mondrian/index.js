const { onChainTvl } = require('../helper/balancer')

const V2_ADDRESS = '0x48cD08ad2065e0cD2dcD56434e393D55A59a4F64'; // shared by all networks

const config = {
  abstract: { fromBlock: 1199036, },
}

Object.keys(config).forEach(chain => {
  const { fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: onChainTvl(V2_ADDRESS, fromBlock)
  }
})
