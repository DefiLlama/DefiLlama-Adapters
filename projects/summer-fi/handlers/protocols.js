const sdk = require("@defillama/sdk");
const { ADDRESSES } = require("../constants/addresses");

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

async function aaveV3Tvl({ api, chain }) {
  const { pool, oracle, poolDataProvider } = ADDRESSES[chain].aaveV3;
  
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

  reservesList.forEach((asset, i) => {
    const supply = aTokenSupplies[i];
    if (supply > 0) {
      api.add(asset, supply);
    }
  });
}

async function ajnaTvl({ api, chain }) {
  const { pool, quoteToken } = ADDRESSES[chain].ajna;
  
  const pools = await api.call({
    abi: AJNA_ABI.getPools,
    target: pool
  });

  const poolsInfo = await api.multiCall({
    abi: AJNA_ABI.getPoolInfo,
    calls: pools.map(poolAddress => ({ target: pool, params: [poolAddress] }))
  });

  poolsInfo.forEach((info) => {
    if (info.collateral > 0) {
      api.add(info.quoteTokenAddress, info.collateral);
    }
  });
}

async function morphoBlueTvl({ api, chain }) {
  const { market, urdFactory } = ADDRESSES[chain].morphoBlue;
  
  const marketData = await api.call({
    abi: MORPHO_BLUE_ABI.getMarketData,
    target: market
  });

  const urdData = await api.call({
    abi: MORPHO_BLUE_ABI.getURDData,
    target: urdFactory
  });

  if (marketData.totalSupplyAssets > 0) {
    api.add(market, marketData.totalSupplyAssets);
  }
  if (urdData.totalSupply > 0) {
    api.add(urdFactory, urdData.totalSupply);
  }
}

module.exports = {
  aaveV3Tvl,
  ajnaTvl,
  morphoBlueTvl,
}; 