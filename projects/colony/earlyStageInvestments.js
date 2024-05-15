const { getLogs } = require('../helper/cache/getLogs');

/// Accumulated early stage USD investments in the project nests
function earlyStageInvestments(earlyStageManager, projectNestFactory) {
  console.log("got args", earlyStageManager, projectNestFactory)
  return async (api) => {

    const totalNests = Number(await api.call({
      abi: "uint256:projectNestsLength",
      target: projectNestFactory,
    }))

    console.log("totalNests", totalNests, typeof(totalNests))

    const nests = []
    const limit = 100
    for (let i = 0; i < totalNests; i += limit) {
      const offset = i

      const n = await api.call({
        abi: "function getProjectNests(uint256 limit, uint256 offset) external view returns (address[] memory result)",
        target: projectNestFactory,
        params: [limit, offset]
      })
      console.log()

      nests.push(...n)
    }

    console.log("nests: ", nests)

    for (const nest of nests) {
      const stablecoin = await api.call({
        abi: "address:supportedStablecoin",
        target: nest
      })

      const balance = await api.call({
        abi: 'erc20:balanceOf',
        target: stablecoin,
        params: nest
      })

      console.log(`balance of stable coin ${stablecoin} in nest ${nest} is ${balance}`)

      api.add(stablecoin, await api.call({
        abi: 'erc20:balanceOf',
        target: stablecoin,
        params: nest
      }))
    }
    console.log("api balances:", await api.getBalances())

    return api.getBalances()
  }
}

module.exports = {
  earlyStageInvestments,
}
