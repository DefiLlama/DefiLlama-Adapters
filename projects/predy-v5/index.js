const v5Address = '0x06a61E55d4d4659b1A23C0F20AEdfc013C489829';

const abi = {
  v5: {
    getAsset: "function getAsset(uint256 _id) view returns (tuple(uint256 id, uint256 pairGroupId, tuple(address token, address supplyTokenAddress, tuple(uint256 totalCompoundDeposited, uint256 totalNormalDeposited, uint256 totalNormalBorrowed, uint256 assetScaler, uint256 assetGrowth, uint256 debtGrowth) tokenStatus, tuple(uint256 baseRate, uint256 kinkRate, uint256 slope1, uint256 slope2) irmParams) stablePool, tuple(address token, address supplyTokenAddress, tuple(uint256 totalCompoundDeposited, uint256 totalNormalDeposited, uint256 totalNormalBorrowed, uint256 assetScaler, uint256 assetGrowth, uint256 debtGrowth) tokenStatus, tuple(uint256 baseRate, uint256 kinkRate, uint256 slope1, uint256 slope2) irmParams) underlyingPool, tuple(uint256 riskRatio, int24 rangeSize, int24 rebalanceThreshold) riskParams, tuple(address uniswapPool, int24 tickLower, int24 tickUpper, uint64 numRebalance, uint256 totalAmount, uint256 borrowedAmount, uint256 lastRebalanceTotalSquartAmount, uint256 lastFee0Growth, uint256 lastFee1Growth, uint256 borrowPremium0Growth, uint256 borrowPremium1Growth, uint256 fee0Growth, uint256 fee1Growth, tuple(int256 positionAmount, uint256 lastFeeGrowth) rebalancePositionUnderlying, tuple(int256 positionAmount, uint256 lastFeeGrowth) rebalancePositionStable, int256 rebalanceFeeGrowthUnderlying, int256 rebalanceFeeGrowthStable) sqrtAssetStatus, bool isMarginZero, bool isIsolatedMode, uint256 lastUpdateTimestamp) data)",
    globalData: "function globalData() view returns (uint256 pairGroupsCount, uint256 pairsCount, uint256 vaultCount)",
  }
}

async function tvl(api) {
  const { pairsCount } = await api.call({ abi: abi.v5.globalData, target: v5Address })
  const data = await api.fetchList({ itemCount: pairsCount - 1, startFromOne: true, itemAbi: abi.v5.getAsset, target: v5Address })
  const tokens = []
  data.forEach(({ stablePool, underlyingPool }) => {
    tokens.push(stablePool.token)
    tokens.push(underlyingPool.token)
  })
  return api.sumTokens({ tokens, owner: v5Address, })
}

async function borrowed(api) {
  const { pairsCount } = await api.call({ abi: abi.v5.globalData, target: v5Address })
  const data = await api.fetchList({ itemCount: pairsCount - 1, startFromOne: true, itemAbi: abi.v5.getAsset, target: v5Address })
  data.forEach(({ stablePool, underlyingPool }) => {
    api.add(stablePool.token, stablePool.tokenStatus.totalNormalBorrowed)
    api.add(underlyingPool.token, underlyingPool.tokenStatus.totalNormalBorrowed)
  })
}

module.exports = {
  methodology: "USDC and WETH locked on predy contracts",
  arbitrum: {
    tvl,
    borrowed,
  },
  hallmarks: [
    [1688490168, "Launch Predy V5"]
  ],
};