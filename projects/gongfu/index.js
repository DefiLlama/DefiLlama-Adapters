// GongFu: on-chain locking protocol on Robinhood Chain.
// Users lock GF for 1/7/30/90/180 days and earn rewards paid from a fixed,
// non-withdrawable reward reserve held by the same contract.
//
// staking = GF principal currently locked by users (principalLiability).
// The free reward reserve (bought once at launch, no withdrawal function)
// is protocol-owned and intentionally NOT counted.

const GF = '0xFEd6b187F6Da04E2EAe5D3ea89B57129Da62b28A'
const GONGFU_POOL = '0x0557b1f2003aac5ae3bf791eea469259786773d2'

const protocolStateAbi = 'function protocolState() view returns (uint8 status, uint64 createdAt, uint64 activatedAt, uint64 windDownAt, uint256 permanentSupportReceived, uint256 uncreditedSupportReceived, uint256 principalLiability, uint256 settledEpochLiability, uint256 claimableReferralLiability, uint256 unsettledMaximumBonus, uint256 openPositionCount, uint256 registeredUserCount, uint64 epochQueueHead, uint256 unsettledEpochCount, address referralQueueHead, address referralQueueCursor, uint256 referralQueueEligibleCount)'

async function staking(api) {
  const state = await api.call({ target: GONGFU_POOL, abi: protocolStateAbi })
  api.add(GF, state.principalLiability)
}

module.exports = {
  methodology: 'Staking counts the GF principal currently locked by users in the GongFuPool contract (principalLiability). The protocol-owned reward reserve held by the same contract is excluded.',
  start: '2026-10-22',
  robinhood: {
    tvl: () => ({}),
    staking,
  },
}
