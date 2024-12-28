module.exports = {
  getPoolCount: 'uint256:getPoolCount',
  pools: 'function pools(uint256) view returns (address)',
  getCurrentPool: "function getCurrentPool() view returns (uint256 _reserve0, uint256 _reserve1)",
  tokenA: "address:tokenA",
  tokenB: "address:tokenB",
}