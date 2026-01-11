const { aaveV2Export, methodology, } = require('../helper/aave')

const abis = {
  getReserveData: "function getReserveData(address asset) view returns (((uint256 data) configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))",
}

module.exports = {
  methodology,
  hydradx: aaveV2Export('0x1b02E051683b5cfaC5929C25E84adb26ECf87B38', { abis })
}