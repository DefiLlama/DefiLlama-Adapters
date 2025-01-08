const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  ethereum: { factory: '0xcB78EbD81D08df037973Afd70D7FeF7b6b0C6B06', fromBlock: 19660555 },
  arbitrum: { factory: '0xac273c1187DDF51E2e57FA71E85ba0924bFb7bb6', fromBlock: 201228430 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: 'event SwapDeployed(address underlying, address swap, address implementation)', fromBlock, })
      const tokensAndOwners = logs.map(log => [log.underlying, log.swap])
      return api.sumTokens({ tokensAndOwners })
    }
  }
})