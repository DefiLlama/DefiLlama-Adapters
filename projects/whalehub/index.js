const { callSoroban } = require('../helper/chain/stellar')

const STAKING_CONTRACT = 'CC72BEVVKHQ57PB5FCKAZYRXCSR6DOQSTN46QR7RZMMM64YWNRPDS24S'
const AQUA_TOKEN = 'CAUIKL3IYGMERDRUN6YSCLWVAKIFG5Q4YJHUKM4S4NJZQIA3BAS6OJPK'
const AQUARIUS_POOL_0 = 'CAMXZXXBD7DFBLYLHUW24U4MY37X7SU5XXT5ZVVUBXRXWLAIM7INI7G2'

// TVL: AQUA deposited by users, represented by the BLUB minted against it.
//
// WhaleHub is a liquid staking protocol: users deposit AQUA and receive BLUB
// 1:1, and the AQUA is committed to Aquarius ICE governance on their behalf, so
// it does not sit in this contract. BLUB is the on-chain record of that locked
// AQUA and is priced as AQUA (1:1 by mint).
//
// Previously this read get_global_state().total_locked — a transient counter
// that rises on deposit and unwinds toward zero as deposits move on to ICE. It
// never held the protocol's locked value and now reads 0, which is why the
// listing shows $0 TVL while the same value is reported under "staking".
//
// total_blub_supply is used rather than the contract's BLUB token balance
// because that balance also holds protocol-owned BLUB from liquidity
// operations: a treasury rebalance on 2026-09-16 moved ~10M BLUB into this
// contract and moved the balance ~35% in a day without any user depositing.
// Supply is unaffected by those transfers. It includes the ~0.1x protocol-
// minted portion that funds POL, so this runs ~9% high, which is the
// conservative direction for a stable series.
async function tvl(api) {
  const state = await callSoroban(STAKING_CONTRACT, 'get_global_state')
  const supply = state && state.total_blub_supply != null
    ? BigInt(state.total_blub_supply)
    : 0n
  if (supply > 0n) {
    api.add(AQUA_TOKEN, supply)
  }
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
    'WhaleHub is a liquid staking protocol on Stellar: users deposit AQUA and receive BLUB 1:1, while the AQUA is committed to Aquarius ICE governance on their behalf. TVL counts BLUB supply minted against those deposits, which is the on-chain record of user-locked AQUA; BLUB is priced as AQUA (1:1 by mint) since it has no separate price feed. Pool2 counts vault user LP deposits in the Aquarius BLUB-AQUA pool. Protocol-owned liquidity is excluded from both.',
  stellar: { tvl, pool2 },
}
