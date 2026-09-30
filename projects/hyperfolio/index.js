const FARM = '0x210Ce7DCB6a068152163D41CD48c9936B29BAb96'

const abi = {
  getAllPoolIds: 'uint256[]:getAllPoolIds',
  getPoolInfo: 'function getPoolInfo(uint256) view returns (address asset, address receiptToken, uint256 apy, uint256 decimals, address vault, bool active, uint256 accRewardPerShare, uint256 lastRewardTime)',
}

async function tvl(api) {
  const pids = await api.call({ abi: abi.getAllPoolIds, target: FARM })
  const pools = await api.multiCall({ abi: abi.getPoolInfo, target: FARM, calls: pids })
  return api.sumTokens({ tokensAndOwners: pools.map(p => [p.asset, p.vault]) })
}

module.exports = {
  methodology: 'Counts the deposit tokens held by each Hyperfolio pool vault, discovered on-chain from the farm contract.',
  hyperliquid: { tvl },
}
