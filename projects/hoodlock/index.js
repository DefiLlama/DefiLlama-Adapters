const { getUniqueAddresses } = require('../helper/utils')
const { getCache } = require('../helper/http')

/* HoodLock, a token locker and vesting protocol on Robinhood Chain.
 *
 * TVL is what the contracts hold right now, read with balanceOf. A withdrawn
 * lock leaves its record behind with a `withdrawn` flag, so summing records
 * would keep counting tokens that already left. The records are read only to
 * discover WHICH tokens each contract holds.
 *
 * Prices come from CoinGecko ids rather than chain addresses. Robinhood Chain
 * tokens are listed on CoinGecko under the `robinhood` platform, but most are
 * not resolvable from their contract address on DefiLlama's side, so pricing
 * by address silently drops them. The id map is fetched at run time so newly
 * locked tokens are picked up without editing this file.
 *
 * Burns are excluded on purpose: burned supply sits at the dead address and is
 * no longer held by any HoodLock contract, so it is not TVL.
 */

const LOCKER = '0xd0f7d8c6e9f6d80c297bebe4f7fd1b9c8125c32f'
const VESTING = '0x910e19bcC4bce46999994Ed7297E0Fc4431ec72E'

const abi = {
  totalLocks: 'uint256:totalLocks',
  locks: 'function locks(uint256) view returns (address owner, address token, uint256 amount, uint256 unlockTime, bool withdrawn)',
  totalSchedules: 'uint256:totalSchedules',
  getSchedule: 'function getSchedule(uint256) view returns ((address creator, uint64 start, address beneficiary, uint64 cliff, address token, uint64 end, uint128 total, uint128 claimed))',
}

/** Ids run 1..n inclusive: both contracts pre-increment their counter. */
const idCalls = (target, n) => Array.from({ length: Number(n) }, (_, i) => ({ target, params: i + 1 }))

async function coingeckoIds() {
  const list = await getCache('https://api.coingecko.com/api/v3/coins/list?include_platform=true')
  const map = {}
  for (const coin of list) {
    const address = coin.platforms && coin.platforms.robinhood
    if (address) map[address.toLowerCase()] = coin.id
  }
  return map
}

async function tvl(api) {
  const [lockCount, scheduleCount] = await Promise.all([
    api.call({ abi: abi.totalLocks, target: LOCKER }),
    api.call({ abi: abi.totalSchedules, target: VESTING }),
  ])

  /* Ids 1..n all exist, so a failed record read is an infrastructure problem,
   * not an expected revert. Let it throw instead of dropping the record: a
   * short list would understate TVL with nothing visible to say so. */
  const [locks, schedules] = await Promise.all([
    api.multiCall({ abi: abi.locks, calls: idCalls(LOCKER, lockCount) }),
    api.multiCall({ abi: abi.getSchedule, calls: idCalls(VESTING, scheduleCount) }),
  ])

  const owners = [
    [LOCKER, getUniqueAddresses(locks.filter(l => l && !l.withdrawn && l.amount > 0).map(l => l.token))],
    [VESTING, getUniqueAddresses(schedules.filter(s => s && s.total > s.claimed).map(s => s.token))],
  ]

  const ids = await coingeckoIds()

  for (const [owner, tokens] of owners) {
    if (!tokens.length) continue
    const [balances, decimals] = await Promise.all([
      api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map(t => ({ target: t, params: owner })), permitFailure: true }),
      api.multiCall({ abi: 'erc20:decimals', calls: tokens, permitFailure: true }),
    ])
    tokens.forEach((token, i) => {
      const id = ids[token]
      const balance = balances[i]
      const dec = decimals[i]
      if (!id || !balance || balance === '0') return   // no price source: contributes nothing
      if (dec == null) return   // unknown decimals cannot be scaled, and assuming 18 would misreport the amount
      api.addCGToken(id, Number(balance) / 10 ** Number(dec))
    })
  }
}

module.exports = {
  methodology:
    'Counts the ERC-20 balances held by the HoodLock locker and vesting contracts on Robinhood Chain. ' +
    'Lock and vesting records are read on chain to find which tokens each contract holds, then every ' +
    'balance is read with balanceOf, so withdrawn locks and fully claimed vesting stop counting ' +
    'automatically. Tokens are priced by their CoinGecko id. Burned supply is excluded because it is ' +
    'sent to the dead address and is no longer held by any HoodLock contract.',
  robinhood: { tvl },
}
