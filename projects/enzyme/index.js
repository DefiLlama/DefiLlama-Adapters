const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  polygon: { endpoint: sdk.graph.modifyEndpoint('GCAHDyqvZBLMwqdb9U7AqWAN4t4TSwR3aXMHDoUUFuRV') },
  ethereum: { endpoint: sdk.graph.modifyEndpoint('9DLBBLep5UyU16kUQRvxBCMqko4q9XzuE4XsMMpARhKK') },
  arbitrum: { endpoint: sdk.graph.modifyEndpoint('8UJ5Bkf2eazZhXsAshhzQ2Keibcb8NFHBvXis9pb2C2Y') },
}
const query = `query get_accounts($lastId: String!) {
  vaults(
    first: 1000
    where: {id_gt: $lastId}
  ) { id trackedAssets { id } }
}`

async function tvl(api) {
  const { endpoint } = config[api.chain]
  const vaults = await cachedGraphQuery('enzyme/' + api.chain, endpoint, query, { fetchById: true, })
  const externalPositions = (await api.multiCall({ calls: vaults.map(i => i.id), abi: 'address[]:getActiveExternalPositions', excludeFailed: true, })).flat()
  const managedAssets = await api.multiCall({ abi: 'function getManagedAssets() external returns (address[] memory assets, uint256[] memory amounts)', calls: externalPositions, excludeFailed: true, })
  const debtAssets = await api.multiCall({ abi: 'function getDebtAssets() external returns (address[] memory assets, uint256[] memory amounts)', calls: externalPositions, excludeFailed: true, })
  managedAssets.forEach(i => api.add(i.assets, i.amounts))
  debtAssets.forEach(i => api.add(i.assets, i.amounts.map(i => -1 * i)))

  return sumTokens2({
    api, ownerTokens: vaults.map(i => {
      return [i.trackedAssets.map(i => i.id), i.id]
    })
  })
}


module.exports = {
  timetravel: false,
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
