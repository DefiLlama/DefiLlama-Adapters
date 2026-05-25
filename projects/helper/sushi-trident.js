const { sumTokens2, } = require('./unwrapLPs')

function getTridentTVLFromFactories({ factories }) {
  return async (api) => {
    for (let factory of factories) {
      await getTridentFactoryTvl(api, factory)
    }
    return api.getBalances()
  }
}

function getTridentTVL({ factory }) {
  return async (api) => { return getTridentFactoryTvl(api, factory) }
}

async function getTridentFactoryTvl(api, factory) {
  const pairs = await api.fetchList({ lengthAbi: 'totalPoolsCount', itemAbi: 'getPoolAddress', target: factory })
  const tokens = await api.multiCall({ abi: abis.getAssets, calls: pairs, })
  const ownerTokens = tokens.map((assets, idx) => [assets, pairs[idx]])
  return sumTokens2({ api, ownerTokens })

}

// taken from https://github.com/pangea-protocol/pangea-core/tree/main/deployments/abis
const abis = {
  totalPoolsCount: "uint256:totalPoolsCount",
  getPoolAddress: "function getPoolAddress(uint256 idx) view returns (address pool)",
  getAssets: "address[]:getAssets",
}

module.exports = {
  getTridentTVLFromFactories,
  getTridentTVL,
}
