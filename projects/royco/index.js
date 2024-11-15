const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  ethereum: { factory: '0xbfac50c6b2c91ab756c1e5efab699438992cc1b2', fromBlock: 21183492 },
  arbitrum: { factory: '0xbfac50c6b2c91ab756c1e5efab699438992cc1b2', fromBlock: 274261481 },
  base: { factory: '0xbfac50c6b2c91ab756c1e5efab699438992cc1b2', fromBlock: 22384258 },
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
