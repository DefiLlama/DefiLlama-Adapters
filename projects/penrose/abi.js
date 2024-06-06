module.exports = {
  penPoolsData: "function penPoolsData() view returns (tuple(address id, address stakingAddress, uint256 stakedTotalSupply, uint256 totalSupply, tuple(address id, string symbol, bool stable, address token0Address, address token1Address, address gaugeAddress, address bribeAddress, address[] bribeTokensAddresses, address fees, uint256 totalSupply) poolData)[])",
  poolsReservesInfo: "function poolsReservesInfo(address[] _poolsAddresses) view returns (tuple(address id, address token0Address, address token1Address, uint256 token0Reserve, uint256 token1Reserve, uint8 token0Decimals, uint8 token1Decimals)[])",
  locked: "function locked(uint256) view returns (int128 amount, uint256 end)",
}