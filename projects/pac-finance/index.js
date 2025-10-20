const { sumTokens2 } = require("../helper/unwrapLPs");

const UiPoolDataProviderABI = {
  "getReservesData": "function getReservesData(address provider) view returns (tuple(address underlyingAsset, string name, string symbol, uint256 decimals, uint256 baseLTVasCollateral, uint256 reserveLiquidationThreshold, uint256 reserveLiquidationBonus, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool stableBorrowRateEnabled, bool isActive, bool isFrozen, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 liquidityRate, uint128 variableBorrowRate, uint128 stableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint256 availableLiquidity, uint256 totalPrincipalStableDebt, uint256 averageStableRate, uint256 stableDebtLastUpdateTimestamp, uint256 totalScaledVariableDebt, uint256 priceInMarketReferenceCurrency, address priceOracle, uint256 variableRateSlope1, uint256 variableRateSlope2, uint256 stableRateSlope1, uint256 stableRateSlope2, uint256 baseStableBorrowRate, uint256 baseVariableBorrowRate, uint256 optimalUsageRatio, bool isPaused, bool isSiloedBorrowing, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt, bool flashLoanEnabled, uint256 debtCeiling, uint256 debtCeilingDecimals, uint8 eModeCategoryId, uint256 borrowCap, uint256 supplyCap, uint16 eModeLtv, uint16 eModeLiquidationThreshold, uint16 eModeLiquidationBonus, address eModePriceSource, string eModeLabel, bool borrowableInIsolation)[], tuple(uint256 marketReferenceCurrencyUnit, int256 marketReferenceCurrencyPriceInUsd, int256 networkBaseTokenPriceInUsd, uint8 networkBaseTokenPriceDecimals))"
}

const address = {
  blast: {
    UiPoolDataProvider: "0x1205529dc4fe0844039099cf7125aEF38B7c058F",
    PoolAddressProvider: "0x688B5fd3C3E3724b4De08C4BCB3A755F9b579c9a",
  },
};

async function tvl(api) {
  const { UiPoolDataProvider, PoolAddressProvider } = address[api.chain];
  let [reservesData] = await api.call({
    target: UiPoolDataProvider,
    params: PoolAddressProvider,
    abi: UiPoolDataProviderABI.getReservesData,
  });

  let toa = reservesData.map((i) => [i.underlyingAsset, i.aTokenAddress]);

  return sumTokens2({ api, resolveLP: true, tokensAndOwners: toa });
}

async function borrowed(api) {
  const { UiPoolDataProvider, PoolAddressProvider } = address[api.chain];
  let [reservesData] = await api.call({
    target: UiPoolDataProvider,
    params: PoolAddressProvider,
    abi: UiPoolDataProviderABI.getReservesData,
  });

  reservesData.forEach((d) => {
    api.add(d.underlyingAsset, d.totalScaledVariableDebt * d.variableBorrowIndex * 1e-27)
  });

  return sumTokens2({ api, resolveLP: true, });
}

module.exports = {
  deadFrom: '2025-03-01',
  blast: { tvl, borrowed },
};
