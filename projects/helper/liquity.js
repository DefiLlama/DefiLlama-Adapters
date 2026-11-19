const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs')

// Accepts either a single trove manager address (with config in the 2nd arg),
// or an array of trove configs: [{ troveManager, collateralToken?, nonNativeCollateralToken?, abis? }, ...]
function getLiquityTvl(troveManagers, config = {}) {
  const troves = Array.isArray(troveManagers)
    ? troveManagers
    : [{ troveManager: troveManagers, ...config }]
  return async (api) => {
    for (const { troveManager, nonNativeCollateralToken = false, abis = {}, collateralToken } of troves) {
      const activePool = await api.call({ target: troveManager, abi: abis.activePool ?? "address:activePool", })
      const defaultPool = await api.call({ target: troveManager, abi: "address:defaultPool", })
      let token = nullAddress
      if (collateralToken) token = collateralToken
      else if (nonNativeCollateralToken) token = await api.call({ target: troveManager, abi: abis.collateralToken ?? "address:collateralToken", })
      await sumTokens2({ api, owners: [activePool, defaultPool], tokens: [token] })
    }
    return api.getBalances()
  }
}

// Accepts either a single collateral registry address (with config in the 2nd arg),
// or an array of registry configs: [{ collateralRegistry, abis? }, ...] / [address, ...]
function getLiquityV2Tvl(collateralRegistries, config = {}) {
  const registries = (Array.isArray(collateralRegistries) ? collateralRegistries : [collateralRegistries])
    .map(r => typeof r === 'string' ? { collateralRegistry: r, ...config } : r)
  return async (api) => {
    for (const { collateralRegistry, abis = {} } of registries) {
      const troves = await api.fetchList({ lengthAbi: abis.totalCollaterals ?? 'totalCollaterals', itemAbi: abis.getTroveManager ?? 'getTroveManager', target: collateralRegistry })
      const activePools = await api.multiCall({ abi: abis.activePool ?? 'address:activePool', calls: troves })
      const defaultPools = await api.multiCall({ abi: abis.defaultPoolAddress ?? 'address:defaultPoolAddress', calls: activePools })
      const tokens = await api.multiCall({ abi: abis.collToken ?? 'address:collToken', calls: activePools })
      await sumTokens2({ api, tokensAndOwners2: [tokens.concat(tokens), activePools.concat(defaultPools)] })
    }
    return api.getBalances()
  }
}

module.exports = {
  getLiquityTvl,
  getLiquityV2Tvl,
};
