const { callSoroban } = require('../helper/chain/stellar')
const { lockedAqua } = require('./iceLocks')

const STAKING_CONTRACT = 'CC72BEVVKHQ57PB5FCKAZYRXCSR6DOQSTN46QR7RZMMM64YWNRPDS24S'
const AQUA_TOKEN = 'CAUIKL3IYGMERDRUN6YSCLWVAKIFG5Q4YJHUKM4S4NJZQIA3BAS6OJPK'
const AQUARIUS_POOL_0 = 'CAMXZXXBD7DFBLYLHUW24U4MY37X7SU5XXT5ZVVUBXRXWLAIM7INI7G2'

// TVL: AQUA locked for Aquarius ICE governance, read from the claimable
// balances that hold it.
//
// WhaleHub is a liquid staking protocol on Stellar: users deposit AQUA and
// receive BLUB, and the AQUA is committed to Aquarius ICE governance on their
// behalf. It does not sit in the staking contract, so the contract's own
// counters cannot be used:
//
//   - total_locked is a transient counter that rises on deposit and unwinds as
//     deposits move on to ICE. It reads 0, which is why the listing showed $0.
//   - total_blub_supply is not a mint counter: lock() adds the minted amount
//     but stake() also adds the deposited amount and unstake() subtracts it, so
//     a user who locks AQUA and then stakes the resulting BLUB is counted twice.
//   - Summing get_ice_lock_authorization ids gives gross cumulative AQUA ever
//     sent out to be locked. That log is append-only — nothing decrements it —
//     so it can only rise, and it would keep counting balances that unlock from
//     2029 onward.
//
// The claimable balances are the actual position: verifiable by anyone, no
// contract state involved, and they fall away as locks are claimed.
// Protocol-owned locks are excluded here and reported in treasury/whalehub.js.
async function tvl(api) {
  const { user } = await lockedAqua()
  if (user > 0) api.add(AQUA_TOKEN, Math.round(user * 1e7))
}

// Pool2: vault user LP deposits in the Aquarius BLUB-AQUA pool (excludes POL)
async function pool2(api) {
  const [poolInfo, reserves, totalShares] = await Promise.all([
    callSoroban(STAKING_CONTRACT, 'get_pool_info', [0]),
    callSoroban(AQUARIUS_POOL_0, 'get_reserves'),
    callSoroban(AQUARIUS_POOL_0, 'get_total_shares'),
  ])

  if (!poolInfo || !reserves || !totalShares) return

  const vaultLp = poolInfo.total_lp_tokens != null ? BigInt(poolInfo.total_lp_tokens) : 0n
  if (vaultLp <= 0n) return

  const ratio = Number(vaultLp) / Number(totalShares)
  // Aquarius pool orders by contract address: AQUA < BLUB
  const aquaInLp = BigInt(Math.round(Number(reserves[0]) * ratio))
  const blubInLp = BigInt(Math.round(Number(reserves[1]) * ratio))
  api.add(AQUA_TOKEN, aquaInLp)
  api.add(AQUA_TOKEN, blubInLp)
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    'WhaleHub is a liquid staking protocol on Stellar: users deposit AQUA and receive BLUB, while the AQUA is committed to Aquarius ICE governance on their behalf. TVL is the AQUA held in the Stellar claimable balances that back those ICE locks, read from Horizon; AQUA the protocol locked from its own funds is excluded and reported as treasury. Pool2 counts vault user LP deposits in the Aquarius BLUB-AQUA pool, valued in AQUA since BLUB has no separate price feed; protocol-owned liquidity is excluded from pool2.',
  stellar: { tvl, pool2 },
}
