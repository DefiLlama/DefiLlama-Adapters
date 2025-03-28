const { aaveV2Export } = require('../helper/aave.js');

module.exports = {
  deadFrom: '2024-10-08',
  mantle: aaveV2Export('0x4bbea708f4e48eb0bb15e0041611d27c3c8638cf', { abis: {
    "getReserveData": "function getReserveData(address asset) view returns (tuple(tuple(uint256 data) configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))"
  } })
}
