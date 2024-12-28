const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  ethereum: { factory: '0xBE86f647b167567525cCAAfcd6f881F1Ee558216', fromBlock: 12675821, },
  arbitrum: { factory: '0xE77b89FEc41A7b7dC74eb33602e82F0672FbB33C', fromBlock: 12080098, },
}
module.exports = {
  methodology: "Counts total value of nfts in all the vaults",
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (chain === 'arbitrum') return {}  // we dont price any token in arbitrum
      const logs = await getLogs2({
        api,
        factory,
        eventAbi: 'event NewVault (uint256 indexed vaultId, address vaultAddress, address assetAddress)',
        fromBlock,
      })
      const tokensAndOwners = logs.map(log => [log.assetAddress, log.vaultAddress])
      return sumTokens2({ api, tokensAndOwners, permitFailure: true })
    }
  }
})
