const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  ethereum: { factory: '0xb316D165D01aC68d31B297F847533D671c965662', fromBlock: 21040754 },
  arbitrum: { factory: '0xb316D165D01aC68d31B297F847533D671c965662', fromBlock: 267610608 },
  base: { factory: '0xb316D165D01aC68d31B297F847533D671c965662', fromBlock: 21548421 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: 'event WrappedVaultCreated (address indexed underlyingVaultAddress, address indexed incentivizedVaultAddress, address owner, address inputToken, uint256 frontendFee, string name, string vaultSymbol)', fromBlock, })
      const tokensAndOwners = logs.map(log => [log.underlyingVaultAddress, log.incentivizedVaultAddress])
      return api.sumTokens({ tokensAndOwners })

    }
  }
})