const { onChainTvl } = require('../helper/balancer')

const V3_ADDRESS = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'; // TODO: update with V3 Vault address

const config = {
  ethereum: { fromBlock: 12272146, },
  xdai: { fromBlock: 24821598, }
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: onChainTvl(V3_ADDRESS, fromBlock)
  }
})
