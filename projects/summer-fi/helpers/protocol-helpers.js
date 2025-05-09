const sdk = require("@defillama/sdk");

const AAVE_V3_ABI = {
  getReservesList: "function getReservesList() view returns (address[])",
  getReserveData: "function getReserveData(address asset) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))",
  getATokenTotalSupply: "function totalSupply() view returns (uint256)",
  getReserveConfigurationData: "function getReserveConfigurationData(address asset) view returns (tuple(uint256 ltv, uint256 liquidationThreshold, uint256 liquidationBonus, uint256 decimals, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool stableBorrowRateEnabled, bool isActive, bool isFrozen))"
};

const AJNA_ABI = {
  getPoolInfo: "function getPoolInfo(address pool) view returns (tuple(uint256 collateral, uint256 debt, uint256 depositSize, uint256 quoteTokenAddress))",
  getPools: "function getPools() view returns (address[])"
};

const MORPHO_BLUE_ABI = {
  getMarketData: "function getMarketData(address market) view returns (tuple(uint256 totalSupplyAssets, uint256 totalBorrowAssets, uint256 totalSupplyShares, uint256 totalBorrowShares))",
  getURDData: "function getURDData(address urd) view returns (tuple(uint256 totalSupply, uint256 totalBorrow))"
};

async function getAaveV3Data({ api, pool, oracle, poolDataProvider }) {
  const reservesList = await api.call({
    abi: AAVE_V3_ABI.getReservesList,
    target: pool
  });

  const reservesData = await api.multiCall({
    abi: AAVE_V3_ABI.getReserveData,
    calls: reservesList.map(asset => ({ target: pool, params: [asset] }))
  });

  const aTokenSupplies = await api.multiCall({
    abi: AAVE_V3_ABI.getATokenTotalSupply,
    calls: reservesData.map(data => ({ target: data.aTokenAddress }))
  });

  const result = {};
  reservesList.forEach((asset, i) => {
    const supply = aTokenSupplies[i];
    if (supply > 0) {
      result[asset] = supply;
    }
  });

  return result;
}

async function getAjnaData({ api, pool, quoteToken }) {
  const pools = await api.call({
    abi: AJNA_ABI.getPools,
    target: pool
  });

  const poolsInfo = await api.multiCall({
    abi: AJNA_ABI.getPoolInfo,
    calls: pools.map(poolAddress => ({ target: pool, params: [poolAddress] }))
  });

  const result = {};
  poolsInfo.forEach((info, i) => {
    if (info.collateral > 0) {
      result[info.quoteTokenAddress] = info.collateral;
    }
  });

  return result;
}

async function getMorphoBlueData({ api, market, urdFactory }) {
  const marketData = await api.call({
    abi: MORPHO_BLUE_ABI.getMarketData,
    target: market
  });

  const urdData = await api.call({
    abi: MORPHO_BLUE_ABI.getURDData,
    target: urdFactory
  });

  return {
    [market]: marketData.totalSupplyAssets,
    [urdFactory]: urdData.totalSupply
  };
}

module.exports = {
  getAaveV3Data,
  getAjnaData,
  getMorphoBlueData
}; 