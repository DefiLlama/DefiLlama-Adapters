const { getLogs2 } = require('../helper/cache/getLogs')

module.exports = {
  start: '2025-02-17', // February 17, 2025 10:32:30 UTC
  methodology: "The combined TVL all vaults",
}

const config = {
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: 'event VaultCreated(address indexed underlying, address indexed vault)', fromBlock, })
      const tokensAndOwners = logs.map(log => [log.underlying, log.vault])
      return api.sumTokens({ tokensAndOwners })
    }
  }
})
