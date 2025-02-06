const config = {
  optimism: { pool: '0x60F015F66F3647168831d31C7048ca95bb4FeaF9', },
  base: { pool: '0x60F015F66F3647168831d31C7048ca95bb4FeaF9', },
}

Object.keys(config).forEach(chain => {
  const { pool } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const reserveData = await getReserveData(api)
      return api.sumTokens({ tokensAndOwners: reserveData.map(i => [i.token, i.aTokenAddress])})
    },
    borrowed: async (api) => {
      const reserveData = await getReserveData(api)
      const borrows = await api.multiCall({  abi: 'erc20:totalSupply', calls: reserveData.map(i => i.variableDebtTokenAddress)})
      api.addTokens(reserveData.map(i => i.token), borrows)
      return api.getBalances()
    },
  }

  async function getReserveData(api) {
    let trancheId = 0
    let hasMoreTranches = true
    let data = []
    do {
      let reserves
      try {
        reserves = await api.call({ target: pool, abi: abi.getReservesList, params: [trancheId] })
      } catch (e) {
        hasMoreTranches = false
        return data
      }
      if (!reserves.length) return data
      const iData = await api.multiCall({ abi: abi.getReserveData, calls: reserves.map(i => ({ params: [i, trancheId] })), target: pool })
      reserves.forEach((reserve, i) => iData[i].token = reserve)
      data.push(...iData)
      trancheId++
    } while (hasMoreTranches)
  }
})

const abi = {
  "getReserveData": "function getReserveData(address asset, uint64 trancheId) view returns (tuple(tuple(uint256 data) configuration, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address variableDebtTokenAddress, uint8 id, address interestRateStrategyAddress, uint64 baseLTV, uint64 liquidationThreshold, uint64 liquidationBonus, uint64 borrowFactor))",
  "getReservesList": "function getReservesList(uint64 trancheId) view returns (address[])",
}