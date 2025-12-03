const DHEDGE_FACTORY_ABI =
    "function getManagedPools(address manager) view returns (address[] managedPools)";

const DHEDGE_POOL_LOGIC_ABI =
    "function poolManagerLogic() view returns (address)";

const MSTABLE_POOL_MANAGER_LOGIC_ABI =
    "function getFundComposition() view returns (tuple(address asset, bool isDeposit)[] assets, uint256[] balances)";

const AAVE_GET_RESERVE_DATA =
    "function getReserveData(address asset) view returns (((uint256 data) configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))";

const AAVE_GET_RESERVES_LIST = "address[]:getReservesList";

const AAVE_GET_USER_RESERVE_DATA =
    "function getUserReserveData(address asset, address user) view returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)";


module.exports = {
  DHEDGE_FACTORY_ABI,
  DHEDGE_POOL_LOGIC_ABI,
  MSTABLE_POOL_MANAGER_LOGIC_ABI,
  AAVE_GET_RESERVE_DATA,
  AAVE_GET_RESERVES_LIST,
  AAVE_GET_USER_RESERVE_DATA
};
