const sdk = require('@defillama/sdk');
const { nullAddress } = require('../helper/unwrapLPs')
const abi = { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getReservesData", "outputs": [{ "components": [{ "internalType": "address", "name": "underlyingAsset", "type": "address" }, { "internalType": "address", "name": "pricingAsset", "type": "address" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "uint256", "name": "decimals", "type": "uint256" }, { "internalType": "uint256", "name": "baseLTVasCollateral", "type": "uint256" }, { "internalType": "uint256", "name": "reserveLiquidationThreshold", "type": "uint256" }, { "internalType": "uint256", "name": "reserveLiquidationBonus", "type": "uint256" }, { "internalType": "uint256", "name": "reserveFactor", "type": "uint256" }, { "internalType": "bool", "name": "usageAsCollateralEnabled", "type": "bool" }, { "internalType": "bool", "name": "borrowingEnabled", "type": "bool" }, { "internalType": "bool", "name": "stableBorrowRateEnabled", "type": "bool" }, { "internalType": "bool", "name": "isActive", "type": "bool" }, { "internalType": "bool", "name": "isFrozen", "type": "bool" }, { "internalType": "uint128", "name": "liquidityIndex", "type": "uint128" }, { "internalType": "uint128", "name": "variableBorrowIndex", "type": "uint128" }, { "internalType": "uint128", "name": "liquidityRate", "type": "uint128" }, { "internalType": "uint128", "name": "variableBorrowRate", "type": "uint128" }, { "internalType": "uint128", "name": "stableBorrowRate", "type": "uint128" }, { "internalType": "uint40", "name": "lastUpdateTimestamp", "type": "uint40" }, { "internalType": "address", "name": "depositTokenAddress", "type": "address" }, { "internalType": "address", "name": "stableDebtTokenAddress", "type": "address" }, { "internalType": "address", "name": "variableDebtTokenAddress", "type": "address" }, { "internalType": "address", "name": "strategy", "type": "address" }, { "internalType": "bool", "name": "isExternalStrategy", "type": "bool" }, { "internalType": "uint256", "name": "availableLiquidity", "type": "uint256" }, { "internalType": "uint256", "name": "totalPrincipalStableDebt", "type": "uint256" }, { "internalType": "uint256", "name": "averageStableRate", "type": "uint256" }, { "internalType": "uint256", "name": "totalStableDebt", "type": "uint256" }, { "internalType": "uint256", "name": "stableDebtLastUpdateTimestamp", "type": "uint256" }, { "internalType": "uint256", "name": "totalScaledVariableDebt", "type": "uint256" }, { "internalType": "uint256", "name": "priceInEth", "type": "uint256" }], "internalType": "struct IUiPoolDataProvider.AggregatedReserveData[]", "name": "", "type": "tuple[]" }, { "components": [{ "internalType": "address", "name": "underlyingAsset", "type": "address" }, { "internalType": "uint256", "name": "scaledDepositTokenBalance", "type": "uint256" }, { "internalType": "bool", "name": "usageAsCollateralEnabledOnUser", "type": "bool" }, { "internalType": "uint256", "name": "stableBorrowRate", "type": "uint256" }, { "internalType": "uint256", "name": "scaledVariableDebt", "type": "uint256" }, { "internalType": "uint256", "name": "principalStableDebt", "type": "uint256" }, { "internalType": "uint256", "name": "stableBorrowLastUpdateTimestamp", "type": "uint256" }], "internalType": "struct IUiPoolDataProvider.UserReserveData[]", "name": "", "type": "tuple[]" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }

const config = {
  ethereum: '0x8F5273c5aa638e946BC5dD2171Ae9E9184C75228',
  bsc: '0xa450547F27F0947760C9C818d9fd2CD51DFA7441',
  avax: '0x483B76b13B14DB4fF49359aF9DF3A51F25FaB6a0',
  xdai: '0x75e5cF901f3A576F72AB6bCbcf7d81F1619C6a12',
}

module.exports = {
  methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.",
};

Object.keys(config).forEach(chain => {
  const provider = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const balances = {}
      const data = await api.call({ abi, target: provider, params: nullAddress })
      data[0].forEach(i => {
        sdk.util.sumSingleBalance(balances, i.underlyingAsset, i.availableLiquidity, chain)
      })
      return balances
    },
    borrowed: async (_, _b, _cb, { api, }) => {
      const balances = {}
      const data = await api.call({ abi, target: provider, params: nullAddress })
      data[0].forEach(i => {
        sdk.util.sumSingleBalance(balances, i.underlyingAsset, +i.totalPrincipalStableDebt + +i.totalScaledVariableDebt, chain)
      })
      return balances
    },
  }
})
