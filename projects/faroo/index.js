const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

const WPROS = ADDRESSES.pharos.WPROS
const STPROS = '0x6b0a44c64190279f7034b77c13a566e914fe5ec4'
const STAKING = '0x4100000000000000000000000000000000000000'
const V4_BLOCK = 20813316
const slps = [
  { address: '0xec1d6163e05b3f5d0fb8f354881f6c8b793ad612', fromBlock: 20737836 },
  { address: '0xc53d2c9dd1e488e23ff77e219ca68d8138f90c2c', fromBlock: 20737878 },
]
const owners = [...new Set([
  STPROS,
  '0xf772b375f93650f798bf724ce7a9a45c9e7a579f', // SlpDistributor
  '0xf1df1cb080256f48e8702c24149136e4a6dec25e', // BridgeVault
  '0xd0c44d3079e97ff285dd7a3e4e0246320a9487e5', // RewardsVault
  ...slps.map(slp => slp.address),
])]
const poolRegistered = 'event PoolIdRegistered(address indexed sender, bytes32 indexed poolId)'
const delegatorAbi = 'function getDelegator(bytes32 poolId, address delegator) view returns (tuple(uint256 principalStake, uint256 stake, uint256 accumulatedRewardPerShare, uint256 rewards, uint256 pendingStake, uint256 pendingWithdrawStake, uint256 pendingWithdrawWindow, uint256 totalRewardsClaimed, bool isPendingUndelegate))'
const undelegationsAbi = 'function getUserPendingUndelegations(address delegator) view returns (tuple(address delegator, bytes32 poolId, uint256 amount, uint256 unlockEpoch, uint256 pendingWithdrawWindow, bool processed, uint256 principalAmount, uint256 rewardAmount)[])'

async function tvl(api) {
  const block = await api.getBlock()
  if (block < V4_BLOCK) return api.sumTokens({ owner: STPROS, tokens: [WPROS] })

  await api.sumTokens({ owners, tokens: [WPROS] })
  const nativeBalances = await api.getEthBalances({ owners })
  nativeBalances.forEach(balance => api.add(WPROS, balance))

  for (const { address, fromBlock } of slps) {
    const [logs, registeredPools, undelegations] = await Promise.all([
      getLogs2({ api, target: address, eventAbi: poolRegistered, fromBlock, toBlock: block }),
      api.call({ target: address, abi: 'function registeredPools() view returns (bytes32[])' }),
      api.call({ target: STAKING, abi: undelegationsAbi, params: [address] }),
    ])
    // An unregistered pool can still hold principal, so retain every historically registered pool.
    const pools = [...new Set([...registeredPools, ...logs.map(log => log.poolId)].map(pool => pool.toLowerCase()))]
    const delegations = pools.length ? await api.multiCall({
      target: STAKING,
      abi: delegatorAbi,
      calls: pools.map(pool => ({ params: [pool, address] })),
    }) : []
    // principalStake already includes pendingStake; virtual rewards are excluded.
    delegations.forEach(position => api.add(WPROS, position.principalStake))
    undelegations.filter(position => !position.processed).forEach(position => api.add(WPROS, position.principalAmount))
  }
}

module.exports = {
  methodology: 'Counts WPROS and native PROS held in Faroo custody contracts on Pharos, plus network staking principal and unprocessed unbonding principal. Queued redemptions remain counted until paid. Excludes unminted virtual staking rewards; Oracle NAV and Hybrid Vault stPROS are not added again. Before the V4 upgrade, counts WPROS held by stPROS.',
  start: '2026-06-29',
  pharos: { tvl },
}
