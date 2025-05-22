const { onChainTvl } = require('../helper/balancer')

const V2_ADDRESS = '0x56d3719CcB48124d7CeE71F70B3e0bAa860E7FB6'; // Vault

const config = {
  lisk: { fromBlock: 11748904 }
}

Object.keys(config).forEach(chain => {
  const { fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: onChainTvl(V2_ADDRESS, fromBlock)
  }
})
