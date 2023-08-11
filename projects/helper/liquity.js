const { nullAddress } = require("./tokenMapping")

function getLiquityTvl(TROVE_MANAGER_ADDRESS, { nonNativeCollateralToken = false, abis = {}, collateralToken, } = {}) {
  return async (_, ethBlock, chainBlocks, { api }) => {
    const activePool = await api.call({ target: TROVE_MANAGER_ADDRESS, abi: abis.activePool ?? "address:activePool", })
    const defaultPool = await api.call({ target: TROVE_MANAGER_ADDRESS, abi: "address:defaultPool", })
    let token = nullAddress
    if (collateralToken) token = collateralToken
    else if (nonNativeCollateralToken) token = await api.call({ target: TROVE_MANAGER_ADDRESS, abi: abis.collateralToken ?? "address:collateralToken", })
    return api.sumTokens({ owners: [activePool, defaultPool], tokens: [token] })
  }
}

module.exports = {
  getLiquityTvl
};
