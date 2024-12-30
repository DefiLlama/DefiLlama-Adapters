const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  ethereum: { factory: '0x75e502644284edf34421f9c355d75db79e343bca', fromBlock: 21244948 },
  arbitrum: { factory: '0x75e502644284edf34421f9c355d75db79e343bca', fromBlock: 277208990 },
  base: { factory: '0x75e502644284edf34421f9c355d75db79e343bca', fromBlock: 22754606 },
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
