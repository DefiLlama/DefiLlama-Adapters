const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  optimism: { fromBlock: 120302044, },
  blast: { fromBlock: 3696521, },
  base: { fromBlock: 14706751, },
  arbitrum: { fromBlock: 223877881, },
}

Object.keys(config).forEach(chain => {
  const { factory = '0x00000000E5E81E25aeaD7fCCb4C9560C6b5b718F', fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({
        api,
        factory,
        eventAbi: 'event VaultDeployed (address indexed vaultTemplate, address indexed chainInterface, address indexed deployer, address vaultAddress, address[] assets, uint256 k)',
        fromBlock,
      })

      return api.sumTokens({ ownerTokens: logs.map(i => [i.assets, i.vaultAddress]) })
    }
  }
})