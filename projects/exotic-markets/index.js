// projects/exotic-markets/index.js

const { getProvider, sumTokens2 } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')
const { sleep } = require('../helper/utils')
const snapshot = require('./vaults.json')

// ---- Config ----
const PROGRAM_ID = new PublicKey('exomt54Csh4fvkUiyV5h6bjNqxDqLdpgHJmLd4eqynk')
const TOKEN_PROG = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const MAX_TAIL_LIMIT = 200
const RATE_LIMIT_RETRIES = 2
const SPL_ACCOUNT_CHUNK_SIZE = 50
// scan this many recent signatures each run (tunable via env)
const TAIL_LIMIT = getTailLimit()
// ----------------

function getTailLimit() {
  const rawLimit = process.env.TAIL_LIMIT
  if (!rawLimit) return 0
  if (!/^\d+$/.test(rawLimit)) return 0

  const parsedLimit = Number(rawLimit)
  if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) return 0

  return Math.min(parsedLimit, MAX_TAIL_LIMIT)
}

function isRateLimitError(error) {
  return /429|too many requests/i.test(error?.message || String(error))
}

async function getMultipleAccountsInfo(conn, publicKeys, { allowRateLimitSkip = false } = {}) {
  for (let attempt = 0; attempt <= RATE_LIMIT_RETRIES; attempt++) {
    try {
      return await conn.getMultipleAccountsInfo(publicKeys)
    } catch (error) {
      if (!isRateLimitError(error)) throw error
      if (attempt === RATE_LIMIT_RETRIES) {
        if (allowRateLimitSkip) return []
        throw error
      }
      await sleep(500 * (attempt + 1))
    }
  }
}

function keyAt(msg, i) {
  const k = msg.accountKeys?.[i]
  return typeof k?.toBase58 === 'function' ? k.toBase58() : String(k || '')
}

async function getTailCandidates(conn) {
  if (TAIL_LIMIT <= 0) return []

  // Fetch most-recent program txs
  let sigs
  try {
    sigs = await conn.getSignaturesForAddress(PROGRAM_ID, { limit: TAIL_LIMIT })
  } catch (error) {
    if (isRateLimitError(error)) return []
    throw error
  }
  const seen = new Set()

  // Very cheap heuristics:
  //  - include every token account appearing in postTokenBalances (actually received/held tokens)
  //  - include initializeAccount* targets from Token Program CPIs (new vaults created)
  for (const s of sigs) {
    let tx
    try {
      tx = await conn.getTransaction(s.signature, { maxSupportedTransactionVersion: 0 })
    } catch (error) {
      if (isRateLimitError(error)) break
      continue
    }
    if (!tx?.meta) continue
    const msg = tx.transaction.message

    for (const b of tx.meta.postTokenBalances || []) {
      const ta = b.account ?? keyAt(msg, b.accountIndex)
      if (ta) seen.add(ta)
    }
    for (const inn of tx.meta.innerInstructions || []) {
      for (const instr of inn.instructions || []) {
        const prog = typeof instr.programIdIndex === 'number' ? keyAt(msg, instr.programIdIndex) : instr.programId
        if (prog !== TOKEN_PROG.toBase58()) continue
        const accs = (instr.accounts || []).map(a => typeof a === 'number' ? keyAt(msg, a) : a)
        if (accs[0]) seen.add(accs[0])   // initializeAccount3 target is account[0]
      }
    }
  }
  seen.delete('11111111111111111111111111111111')
  return [...seen]
}

async function filterToSplTokenAccounts(conn, addrs, options) {
  if (!addrs.length) return []
  // Use owner + data length to verify SPL token accounts quickly.

  const out = []

  for (let i = 0; i < addrs.length; i += SPL_ACCOUNT_CHUNK_SIZE) {
    const chunk = addrs.slice(i, i + SPL_ACCOUNT_CHUNK_SIZE)
    const infos = await getMultipleAccountsInfo(conn, chunk.map(a => new PublicKey(a)), options)

    for (let j = 0; j < infos.length; j++) {
      const info = infos[j]
      if (info && info.owner.equals(TOKEN_PROG) && info.data?.length === 165) {
        out.push(chunk[j])
      }
    }
  }

  return out
}

async function tvl() {
  const { connection } = getProvider()

  const base = snapshot.tokenAccounts || []
  const tailCandidates = await getTailCandidates(connection)
  const baseAccounts = await filterToSplTokenAccounts(connection, base)
  const tailAccounts = await filterToSplTokenAccounts(connection, tailCandidates, { allowRateLimitSkip: true })
  const tokenAccounts = [...new Set([...baseAccounts, ...tailAccounts])]

  return sumTokens2({ tokenAccounts })
}

module.exports = {
  timetravel: false, // discovery uses recent live txs
  solana: { tvl },
  methodology: 'Sums balances of snapshot vault SPL token accounts and can union an optional best-effort live scan of recent program transactions to discover newly created/funded vaults. The snapshot is updated weekly via a separate process.',
}
