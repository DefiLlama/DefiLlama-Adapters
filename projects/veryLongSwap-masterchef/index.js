const abi = {
  "pools": "function pools(uint256) view returns (address token, uint32 endDay, uint32 lockDayPercent, uint32 unlockDayPercent, uint32 lockPeriod, uint32 withdrawalCut1, uint32 withdrawalCut2, bool depositEnabled, uint128 maxDeposit, uint128 minDeposit, uint128 totalDeposited, uint128 maxPoolAmount)"
}

module.exports = {
  astrzk: { tvl },
}

async function tvl(api) {
  const singeStake = '0x1AbF3A81aeb18a0EF9F5e319d7ec7483B45456fa'
  const poolData = await api.fetchList({  lengthAbi: 'poolLength', itemAbi: abi.pools, target: singeStake})
  poolData.forEach(i => api.add(i.token, i.totalDeposited))
}

module.exports.deadFrom = '2025-03-31'  // Astar ZK is shutting down on March 31, 2025: https://docs.astar.network/docs/learn/zkEVM