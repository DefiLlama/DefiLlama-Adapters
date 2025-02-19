const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  arbitrum: { addressProvider: '0x75F805e2fB248462e7817F0230B36E9Fae0280Fc', },
}

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2023-06-27')/1e3), 'Protocol was exploited and lost $370k'],
  ],
};
Object.keys(config).forEach(chain => {
  const { addressProvider } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.call({ abi: abi.getReservesList, target: addressProvider })
      const tokenData = await api.multiCall({ abi: abi.getReserveData, target: addressProvider, calls: tokens, })
      return sumTokens2({ api, tokensAndOwners2: [tokens, tokenData.map(i => i.aTokenAddress)], })
    },
    // borrowed,
  }
})

async function borrowed(api) {
  const { addressProvider } = config[api.chain]
  const tokens = await api.call({ abi: abi.getReservesList, target: addressProvider })
  const tokenData = await api.multiCall({ abi: abi.getReserveData, target: addressProvider, calls: tokens, })
  const vDebtSupply = await api.multiCall({ abi: 'erc20:totalSupply', calls: tokenData.map(i => i.variableDebtTokenAddress), })
  const sDebtSupply = await api.multiCall({ abi: 'erc20:totalSupply', calls: tokenData.map(i => i.stableDebtTokenAddress), })
  tokens.forEach((token, i) => {
    const variableDebt = vDebtSupply[i]
    const stableDebt = sDebtSupply[i]
    api.add(token, variableDebt)
    api.add(token, stableDebt)
  })
  return api.getBalances()
}

const abi = {
  "getReserveData": "function getReserveData(address asset) view returns (tuple(tuple(uint256 data) configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))",
  "getReservesList": "address[]:getReservesList",
}