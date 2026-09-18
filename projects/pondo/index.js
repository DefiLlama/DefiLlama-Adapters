const { getProgramMappingValue } = require('../helper/chain/aleo')

const CORE_PROTOCOL = 'pondo_protocol.aleo'
const DELEGATORS = [
  'delegator1.aleo',
  'delegator2.aleo',
  'delegator3.aleo',
  'delegator4.aleo',
  'delegator5.aleo',
]

// Plain Aleo integers come back like "12345u64" — strip the type suffix.
const toMicrocredits = (v) => (v ? BigInt(String(v).replace(/u\d+$/, '')) : 0n)

// `bonded` / `unbonding` come back as a struct string:
//   "{ validator: aleo1..., microcredits: 12345u64 }"
const bondStateMicrocredits = (v) => {
  if (!v) return 0n
  const m = String(v).match(/microcredits:\s*(\d+)u64/)
  return m ? BigInt(m[1]) : 0n
}

// Small retry wrapper — the public Aleo RPC occasionally rate-limits.
async function getMapping(programId, mappingName, key, retries = 5) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await getProgramMappingValue(programId, mappingName, key)
    } catch (e) {
      if (attempt >= retries - 1) throw e
      await new Promise((r) => setTimeout(r, 300 * 2 ** attempt))
    }
  }
}

async function tvl(api) {
  // 1) Liquid ALEO held by the core protocol account.
  let total = toMicrocredits(await getMapping('credits.aleo', 'account', CORE_PROTOCOL))

  // 2) ALEO delegated through each delegator: liquid account + bonded + unbonding.
  const delegatorTotals = await Promise.all(
    DELEGATORS.map(async (delegator) => {
      const account = await getMapping('credits.aleo', 'account', delegator)
      const bonded = await getMapping('credits.aleo', 'bonded', delegator)
      const unbonding = await getMapping('credits.aleo', 'unbonding', delegator)
      return (
        toMicrocredits(account) +
        bondStateMicrocredits(bonded) +
        bondStateMicrocredits(unbonding)
      )
    })
  )
  for (const t of delegatorTotals) total += t

  // 3) Exclude ALEO reserved for / owed to pending withdrawals — it no longer backs pALEO.
  const bondedWithdrawals = toMicrocredits(await getMapping(CORE_PROTOCOL, 'balances', '1u8'))
  const reservedForWithdrawals = toMicrocredits(await getMapping(CORE_PROTOCOL, 'balances', '2u8'))
  total = total - bondedWithdrawals - reservedForWithdrawals

  api.addCGToken('aleo', Number(total) / 1e6)
  return api.getBalances()
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the total ALEO backing pALEO: liquid credits held by pondo_protocol.aleo plus all credits bonded and unbonding through its five delegators (delegator1-5.aleo), excluding ALEO reserved for pending withdrawals.',
  aleo: { tvl },
}