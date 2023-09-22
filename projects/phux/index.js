const { onChainTvl } = require('../helper/balancer')

const VAULT_ADDRESS = '0x7F51AC3df6A034273FB09BB29e383FCF655e473c';

const config = {
  pulse: { fromBlock: 17500116, },
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: onChainTvl(VAULT_ADDRESS, fromBlock)
  }
})