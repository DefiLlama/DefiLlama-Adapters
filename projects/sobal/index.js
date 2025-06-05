const { onChainTvl } = require('../helper/balancer')

const V2_ADDRESS = '0x7122e35ceC2eED4A989D9b0A71998534A203972C'; // Vault

const config = {
  neon_evm: { fromBlock: 206166057, },
  base: { fromBlock: 2029566 }
}

Object.keys(config).forEach(chain => {
  const { fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: onChainTvl(V2_ADDRESS, fromBlock, { blacklistedTokens: ['0x4440000000000000000000000000000000000002'] })
  }
})
