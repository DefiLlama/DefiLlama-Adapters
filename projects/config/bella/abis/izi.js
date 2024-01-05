
module.exports = {
  mantlePoolABI: "function state() view returns (uint160 sqrtPrice_96, int24 currentPoint, uint16 observationCurrentIndex, uint16 observationQueueLen, uint16 observationNextQueueLen, bool locked, uint128 liquidity, uint128 liquidityX)",
  mantleMiningABI: "function getMiningContractInfo() view returns (address tokenX_, address tokenY_, uint24 fee_, tuple(address rewardToken, address provider, uint256 accRewardPerShare, uint256 rewardPerSecond)[] rewardInfos_, address iziTokenAddr_, int24 rewardUpperTick_, int24 rewardLowerTick_, uint256 lastTouchTime_, uint256 totalVLiquidity_, uint256 startTime_, uint256 endTime_)",
  mantleTotalNiZiABI: "uint256:totalNIZI",
  mantaMiningABI: "function getMiningContractInfo() view returns (address tokenX_, address tokenY_, uint24 fee_, address iziTokenAddr_, uint256 lastTouchTime_, uint256 totalVLiquidity_, uint256 totalTokenX_, uint256 totalTokenY_, uint256 totalNIZI_, uint256 startTime_, uint256 endTime_)"
};
