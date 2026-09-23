const ADDRESSES = require('../helper/coreAssets.json')

// Rayls consensus system contracts (fixed addresses)
const CONSENSUS_REGISTRY = '0x07e17e17e17e17e17e17e17e17e17e17e17e17e1' // also the StakeManager: custodies validator self-stake
const DELEGATION_POOL = '0x07e17e17e17e17e17e17e17e17e17e17e17e17e2'    // custodies delegated stake and unclaimed delegator rewards
const VALIDATOR_STATUS_ANY = 6 // ValidatorStatus.Any: every unretired validator

const abi = {
  getValidators: 'function getValidators(uint8 status) view returns (tuple(bytes blsPubkey, address validatorAddress, uint32 activationEpoch, uint32 exitEpoch, uint8 currentStatus, bool isRetired, bool isDelegated, uint8 stakeVersion)[])',
  getBalanceBreakdown: 'function getBalanceBreakdown(address validator) view returns (uint256 outstandingBalance, uint256 initialStake, uint256 rewards)',
  getTotalDelegatedStake: 'function getTotalDelegatedStake(address validator) view returns (uint256)',
}

async function staking(api) {
  const validators = await api.call({ target: CONSENSUS_REGISTRY, abi: abi.getValidators, params: [VALIDATOR_STATUS_ANY] })
  const calls = validators
    .filter((v) => !v.isRetired)
    .map((v) => v.validatorAddress)
  const [selfStake, delegated] = await Promise.all([
    api.multiCall({ target: CONSENSUS_REGISTRY, abi: abi.getBalanceBreakdown, calls }),
    api.multiCall({ target: DELEGATION_POOL, abi: abi.getTotalDelegatedStake, calls }),
  ])
  // balances[validator] = stake + accrued validator rewards, so subtract rewards; slashing already reduces the balance
  selfStake.forEach((i) => api.add(ADDRESSES.rls.RLS, (BigInt(i.outstandingBalance) - BigInt(i.rewards)).toString()))
  delegated.forEach((i) => api.add(ADDRESSES.rls.RLS, i))
}

module.exports = {
  methodology:
    'RLS staked with Rayls validators: validator self-stake held by the ConsensusRegistry plus stake delegated through the DelegationPool, summed per unretired validator via getBalanceBreakdown and getTotalDelegatedStake. Unclaimed rewards sitting in the DelegationPool and RewardDistributor, and the RLSAccumulator subsidy reserve, are excluded.',
  start: '2026-04-30',
  rls: {
    tvl: () => ({}),
    staking,
  },
}
