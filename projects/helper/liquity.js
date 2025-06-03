const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs')

function getLiquityTvl(TROVE_MANAGER_ADDRESS, { nonNativeCollateralToken = false, abis = {}, collateralToken, } = {}) {
  return async (api) => {
    const activePool = await api.call({ target: TROVE_MANAGER_ADDRESS, abi: abis.activePool ?? "address:activePool", })
    const defaultPool = await api.call({ target: TROVE_MANAGER_ADDRESS, abi: "address:defaultPool", })
    let token = nullAddress
    if (collateralToken) token = collateralToken
    else if (nonNativeCollateralToken) token = await api.call({ target: TROVE_MANAGER_ADDRESS, abi: abis.collateralToken ?? "address:collateralToken", })
    return sumTokens2({ api, owners: [activePool, defaultPool], tokens: [token] })
  }
}

function getLiquityV2Tvl(CollateralRegistry, { abis = {}, } = {}) {
  return async (api) => {
    const troves = await api.fetchList({ lengthAbi: abis.totalCollaterals ?? 'totalCollaterals', itemAbi: abis.getTroveManager ?? 'getTroveManager', target: CollateralRegistry })
    const activePools = await api.multiCall({ abi: abis.activePool ?? 'address:activePool', calls: troves })
    const defaultPools = await api.multiCall({ abi: abis.defaultPoolAddress ?? 'address:defaultPoolAddress', calls: activePools })
    const tokens = await api.multiCall({ abi: abis.collToken ?? 'address:collToken', calls: activePools })
    return sumTokens2({ api, tokensAndOwners2: [tokens.concat(tokens), activePools.concat(defaultPools)] })
  }
}

module.exports = {
  getLiquityTvl,
  getLiquityV2Tvl,
};
