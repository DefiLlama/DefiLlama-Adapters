const { getLogs2 } = require('../helper/cache/getLogs')

module.exports = {
  start: '2025-02-17', // February 17, 2025 10:32:30 UTC
  methodology: "The combined TVL all vaults",
}

const config = {
  plume: { factory: '0xbe3c7Bbc504EA41c21D3810c340Cd15624a3cF59', fromBlock: 357721 },
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
