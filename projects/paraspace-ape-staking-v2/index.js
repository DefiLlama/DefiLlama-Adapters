const address = {
  UniV3Pos: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  Bayc: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
  Mayc: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
  Bakc: "0xba30E5F9Bb24caa003E9f2f0497Ad287FDF95623",
  ApeCoinStaking: "0x5954aB967Bc958940b7EB73ee84797Dc8a2AFbb9",
  ApeCoin: "0x4d224452801ACEd8B2F0aebE155379bb5D594381",

  UiPoolDataProvider: "0xC60e48ddb7C1af0508332FB42d84B51F981e274c",
  PoolAddressProvider: "0xfae470A311f61944346BbB8709CDc2398506Be46",
  cAPE: "0x2E9045e7c001056cbcF5eD837F96A8630075a04D",
  P2PPairStaking: "0x4F773f3FC89b73B34FB57EBc667a245D5e3812F6",
}

async function tvl(api) {
  const { UiPoolDataProvider, PoolAddressProvider, ApeCoinStaking, ApeCoin, P2PPairStaking, cAPE, Bayc, Bakc, Mayc, } = address
  let [reservesData] = await api.call({
    target: UiPoolDataProvider,
    params: PoolAddressProvider,
    abi: "function getReservesData(address provider) view returns (tuple(address underlyingAsset, string name, string symbol, uint256 decimals, uint256 baseLTVasCollateral, uint256 reserveLiquidationThreshold, uint256 reserveLiquidationBonus, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool auctionEnabled, bool isActive, bool isFrozen, bool isPaused, bool isAtomicPricing, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 liquidityRate, uint128 variableBorrowRate, uint40 lastUpdateTimestamp, address xTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, address auctionStrategyAddress, address timeLockStrategyAddress, uint256 availableLiquidity, uint256 totalScaledVariableDebt, uint256 priceInMarketReferenceCurrency, address priceOracle, uint256 variableRateSlope1, uint256 variableRateSlope2, uint256 baseVariableBorrowRate, uint256 optimalUsageRatio, uint128 accruedToTreasury, uint256 borrowCap, uint256 supplyCap, uint8 assetType, tuple(uint256 minThreshold, uint256 midThreshold, uint48 minWaitTime, uint48 midWaitTime, uint48 maxWaitTime, uint48 poolPeriodWaitTime, uint256 poolPeriodLimit, uint256 period, uint128 totalAmountInCurrentPeriod, uint48 lastResetTimestamp) timeLockStrategyData)[], tuple(uint256 marketReferenceCurrencyUnit, int256 marketReferenceCurrencyPriceInUsd, int256 networkBaseTokenPriceInUsd, uint8 networkBaseTokenPriceDecimals))",
  });

  const nMAYC = reservesData.find((r) => r.underlyingAsset.toLowerCase() === Mayc.toLowerCase()).xTokenAddress;
  const nBAYC = reservesData.find((r) => r.underlyingAsset.toLowerCase() === Bayc.toLowerCase()).xTokenAddress;
  const nBAKC = reservesData.find((r) => r.underlyingAsset.toLowerCase() === Bakc.toLowerCase()).xTokenAddress;

  const stakedAddress = [nBAYC, nMAYC, nBAKC, P2PPairStaking, cAPE];

  const allStakes = await api.multiCall({
    target: ApeCoinStaking,
    calls: stakedAddress,
    abi: "function getAllStakes(address _address) external view returns (tuple(uint256 poolId, uint256 tokenId, uint256 deposited, uint256 unclaimed, uint256 rewards24hr, tuple(uint256 mainTokenId, uint256 mainTypePoolId))[])",
  });

  const otherPools = {}
  allStakes.flat().forEach(({ poolId, tokenId, deposited }) => {
    if (poolId === '0') {
      api.add(ApeCoin, deposited)
      return;
    }
    otherPools[`${poolId}-${tokenId}`] = deposited
  })
  api.add(ApeCoin, Object.values(otherPools))
}

module.exports = {
  ethereum: {
    tvl,
  },
};
