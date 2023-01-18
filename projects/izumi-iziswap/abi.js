module.exports = {
  liquidities: "function liquidities(uint256) view returns (int24 leftPt, int24 rightPt, uint128 liquidity, uint256 lastFeeScaleX_128, uint256 lastFeeScaleY_128, uint256 remainTokenX, uint256 remainTokenY, uint128 poolId)",
  liquidityNum: "uint256:liquidityNum",
  pool: "function pool(address tokenX, address tokenY, uint24 fee) view returns (address)",
  poolMetas: "function poolMetas(uint128) view returns (address tokenX, address tokenY, uint24 fee)",
}