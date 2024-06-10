/// Accumulated early stage USD investments in the project nests
function earlyStageInvestments(projectNestFactory) {
  return async (api) => {
    const totalNests = Number(await api.call({
      abi: "uint256:projectNestsLength",
      target: projectNestFactory,
    }))

    const nests = []
    const limit = 100
    for (let i = 0; i < totalNests; i += limit) {
      const offset = i

      const n = await api.call({
        abi: "function getProjectNests(uint256 limit, uint256 offset) external view returns (address[] memory result)",
        target: projectNestFactory,
        params: [limit, offset]
      })
      nests.push(...n)
    }
    const stablecoins = await api.multiCall({  abi: 'address:supportedStablecoin', calls: nests})
    await api.sumTokens({ tokensAndOwners2: [stablecoins, nests]})
    return api.getBalances()
  }
}

module.exports = {
  earlyStageInvestments,
}
