const { getLogs } = require('../helper/cache/getLogs')
const { cachedGraphQuery } = require('../helper/cache')

const getAddresses = `
  query PoolAddresses {
    vaults(first: 1000, orderBy: totalValueLockedUSD, orderDirection: desc) {
      address
      asset {
        address
      }
    }
  }
`

const config = {
  arbitrum: { poolFactory: '0xae4fb6622f25f397587f11638da8ce88c27b5645', poolFromBlock: 119998935, vaultGraph: 'https://api.thegraph.com/subgraphs/name/premian-labs/premia-blue' },
}

Object.keys(config).forEach(chain => {
  const { poolFactory, poolFromBlock, vaultGraph, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: poolFactory,
        eventAbi: "event PoolDeployed(address indexed base, address indexed quote, address oracleAdapter, uint256 strike, uint256 maturity, bool isCallPool, address poolAddress)",
        onlyArgs: true,
        fromBlock: poolFromBlock,
      })
      const ownerTokens = logs.map(log => [[log.base, log.quote], log.poolAddress])
      if (vaultGraph) {
        const { vaults } = await cachedGraphQuery('premia/v3/vaults/'+api.chain, vaultGraph, getAddresses)
        const vaultTokens = vaults.map(log => [[log.asset.address], log.address])
        ownerTokens.push(...vaultTokens)
      }
      return api.sumTokens({ ownerTokens })
    }
  }
})
