// projects/exotic-markets/index.js

const { getProvider, sumTokens2 } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')
const snapshot = require('./vaults.json')

// ---- Config ----
const PROGRAM_ID = new PublicKey('exomt54Csh4fvkUiyV5h6bjNqxDqLdpgHJmLd4eqynk')
const TOKEN_PROG = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
// scan this many recent signatures each run (tunable via env)
const TAIL_LIMIT = Number(process.env.TAIL_LIMIT || 200)
// ----------------

function keyAt(msg, i) {
  const k = msg.accountKeys?.[i]
  return typeof k?.toBase58 === 'function' ? k.toBase58() : String(k || '')
}

async function getTailCandidates(conn) {
  // Fetch most-recent program txs
  const sigs = await conn.getSignaturesForAddress(PROGRAM_ID, { limit: TAIL_LIMIT })
  const seen = new Set()

  // Very cheap heuristics:
  //  - include every token account appearing in postTokenBalances (actually received/held tokens)
  //  - include initializeAccount* targets from Token Program CPIs (new vaults created)
  for (const s of sigs) {
    const tx = await conn.getTransaction(s.signature, { maxSupportedTransactionVersion: 0 })
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

async function filterToSplTokenAccounts(conn, addrs) {
  if (!addrs.length) return []
  // Use owner + data length to verify “is SPL token account” quickly

  const out = []
  const CHUNK_SIZE = 100

  for (let i = 0; i < addrs.length; i += CHUNK_SIZE) {
    const chunk = addrs.slice(i, i + CHUNK_SIZE)
    const infos = await conn.getMultipleAccountsInfo(chunk.map(a => new PublicKey(a)))

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
  const candidates = [...new Set([...base, ...tailCandidates])]
  const tokenAccounts = await filterToSplTokenAccounts(connection, candidates)

  return sumTokens2({ tokenAccounts })
}

module.exports = {
  timetravel: false, // discovery uses recent live txs
  solana: { tvl },
  methodology: 'Sums balances of snapshot vault SPL token accounts and unions a small live scan of recent program transactions to discover newly created/funded vaults. The snapshot is updated weekly via a separate process.',
}
