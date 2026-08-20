const { sumTokens2 } = require('./unwrapLPs')

// Accepts either a single collateral registry address (with config in the 2nd arg),
// or an array of registry configs: [{ collateralRegistry, abis? }, ...] / [address, ...]
function getBaseDollarTvl(collateralRegistries, config = {}) {
  const registries = (Array.isArray(collateralRegistries) ? collateralRegistries : [collateralRegistries])
    .map(r => typeof r === 'string' ? { collateralRegistry: r, ...config } : r)
  return async (api) => {
    for (const { collateralRegistry, abis = {} } of registries) {
      const troves = await api.call({ target: collateralRegistry, abi: abis.getAllTroveManagers ?? 'address[]:getAllTroveManagers' })
      const activePools = await api.multiCall({ abi: abis.activePool ?? 'address:activePool', calls: troves })
      const defaultPools = await api.multiCall({ abi: abis.defaultPoolAddress ?? 'address:defaultPoolAddress', calls: activePools })
      const [tokens, activePoolBalances, defaultPoolBalances] = await Promise.all([
        api.multiCall({ abi: abis.collToken ?? 'address:collToken', calls: activePools }),
        api.multiCall({ abi: abis.getCollBalance ?? 'uint256:getCollBalance', calls: activePools }),
        api.multiCall({ abi: abis.getCollBalance ?? 'uint256:getCollBalance', calls: defaultPools }),
      ])

      // Aero LP collateral is staked outside the pool contracts, so use the pools'
      // internal collateral accounting rather than their ERC-20 balances.
      const balances = {}
      tokens.forEach((token, i) => {
        const key = `${api.chain}:${token.toLowerCase()}`
        const poolBalance = BigInt(activePoolBalances[i]) + BigInt(defaultPoolBalances[i])
        balances[key] = (BigInt(balances[key] ?? 0) + poolBalance).toString()
      })
      await sumTokens2({ api, balances, tokens, resolveLP: true })
      api.addBalances(balances)
    }
    return api.getBalances()
  }
}

module.exports = {
  getBaseDollarTvl,
};
