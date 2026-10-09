const { getUniqueAddresses } = require('../helper/utils')
const { sumTokens2 } = require('../helper/unwrapLPs')

/* HoodLock, a token locker, liquidity locker and vesting protocol on Robinhood Chain.
 *
 * tvl: tokens locked in the token locker plus Uniswap V3/V4 positions locked in
 * the Liquidity Locker. vesting: tokens held by the vesting contract.
 *
 * Value is what the contracts hold right now, read with balanceOf. A withdrawn
 * lock leaves its record behind with a `withdrawn` flag, so summing records
 * would keep counting tokens that already left. The records are read only to
 * discover WHICH tokens each contract holds.
 *
 * HoodLock's own token, LOCK, is reported under staking.
 *
 * Burns are excluded on purpose: burned supply sits at the dead address and is
 * no longer held by any HoodLock contract, so it is not counted.
 *
 * Uniswap V3 and V4 positions locked in the Liquidity Locker count by what the
 * position holds. The locker owns the position NFT for the life of a lock, and
 * its active locks name the position ids, which the shared V3/V4 helpers value.
 * A position that pairs LOCK is reported under pool2.
 */

const LOCKER = '0xd0f7d8c6e9f6d80c297bebe4f7fd1b9c8125c32f'
const VESTING = '0x910e19bcC4bce46999994Ed7297E0Fc4431ec72E'
const LOCK_TOKEN = '0xd5bf43f29bf7aa5bb42ae9e217b84b86eb7a4b94'
const LP_LOCKER = '0x91Aa2dA1956C77F8448E18DCaf53383bCc658e67'
const LP_LOCKER_BLOCK = 80030403 // Liquidity Locker deploy block

const abi = {
  totalLocks: 'uint256:totalLocks',
  locks: 'function locks(uint256) view returns (address owner, address token, uint256 amount, uint256 unlockTime, bool withdrawn)',
  totalSchedules: 'uint256:totalSchedules',
  getSchedule: 'function getSchedule(uint256) view returns ((address creator, uint64 start, address beneficiary, uint64 cliff, address token, uint64 end, uint128 total, uint128 claimed))',
  nextLockId: 'uint256:nextLockId',
  getLock: 'function getLock(uint256) view returns ((address owner, uint40 unlockTime, uint16 collectFeeBps, bool isV4, bool hookVerified, bool withdrawn, address feeRecipient, address token0, address token1, uint256 tokenId))',
}

/** Ids run 1..n inclusive: both contracts pre-increment their counter. */
const idCalls = (target, n) => Array.from({ length: Number(n) }, (_, i) => ({ target, params: i + 1 }))

const notLock = t => t.toLowerCase() !== LOCK_TOKEN.toLowerCase()

/* Ids 1..n all exist, so a failed record read is an infrastructure problem,
 * not an expected revert. Let it throw instead of dropping the record: a
 * short list would understate TVL with nothing visible to say so. */
async function tvl(api) {
  const lockCount = await api.call({ abi: abi.totalLocks, target: LOCKER })
  const locks = await api.multiCall({ abi: abi.locks, calls: idCalls(LOCKER, lockCount) })
  const tokens = getUniqueAddresses(locks.filter(l => !l.withdrawn && l.amount > 0).map(l => l.token)).filter(notLock)
  await sumTokens2({ api, owner: LOCKER, tokens })
  await addLockedPositions(api, (l) => !pairsLock(l))
  return api.getBalances()
}

async function vesting(api) {
  const scheduleCount = await api.call({ abi: abi.totalSchedules, target: VESTING })
  const schedules = await api.multiCall({ abi: abi.getSchedule, calls: idCalls(VESTING, scheduleCount) })
  const tokens = getUniqueAddresses(schedules.filter(s => s.total > s.claimed).map(s => s.token)).filter(notLock)
  return sumTokens2({ api, owner: VESTING, tokens })
}

const pairsLock = (l) => [l.token0, l.token1].some(t => t.toLowerCase() === LOCK_TOKEN.toLowerCase())

/* Active Liquidity Locker locks. Ids start at 1 and nextLockId is the next one
 * to be issued, so 1..nextLockId-1 all exist. */
async function activeLpLocks(api) {
  if (await api.getBlock() < LP_LOCKER_BLOCK) return []
  const next = Number(await api.call({ abi: abi.nextLockId, target: LP_LOCKER }))
  const calls = Array.from({ length: Math.max(0, next - 1) }, (_, i) => ({ target: LP_LOCKER, params: i + 1 }))
  if (!calls.length) return []
  const locks = await api.multiCall({ abi: abi.getLock, calls })
  return locks.filter(l => !l.withdrawn)
}

async function addLockedPositions(api, keep) {
  const locks = (await activeLpLocks(api)).filter(keep)
  const v3 = locks.filter(l => !l.isV4).map(l => l.tokenId)
  const v4 = locks.filter(l => l.isV4).map(l => l.tokenId)
  if (v3.length) await sumTokens2({ api, resolveUniV3: true, uniV3ExtraConfig: { positionIds: v3 } })
  if (v4.length) await sumTokens2({ api, resolveUniV4: true, uniV4ExtraConfig: { positionIds: v4 } })
}

async function pool2(api) {
  await addLockedPositions(api, pairsLock)
  return api.getBalances()
}

const staking = (api) => sumTokens2({ api, owners: [LOCKER, VESTING], tokens: [LOCK_TOKEN] })

module.exports = {
  methodology:
    'TVL counts the ERC-20 balances held by the HoodLock token locker on Robinhood Chain, ' +
    'plus the Uniswap V3 and V4 positions locked in the HoodLock Liquidity Locker, valued by the tokens each position holds. ' +
    'Tokens held by the HoodLock vesting contract are reported as vesting. ' +
    'Lock and vesting records are read on chain to find which tokens each contract holds, then every ' +
    'balance is read with balanceOf, so withdrawn locks and fully claimed vesting stop counting ' +
    'automatically. HoodLock\'s own LOCK token held by the contracts is reported as staking, and locked positions ' +
    'that pair LOCK as pool2. Burned supply ' +
    'is excluded because it is sent to the dead address and is no longer held by any HoodLock contract.',
  robinhood: { tvl, vesting, staking, pool2 },
}
