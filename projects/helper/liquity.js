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

module.exports = {
  getLiquityTvl
};
