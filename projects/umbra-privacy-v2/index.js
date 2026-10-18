const { PublicKey } = require('@solana/web3.js')
const { getConnection } = require('../helper/solana')
const { sleep } = require('../helper/utils')

const TOKEN_VAULT = '2sjnjABJHPEZS8oVdp8nztPBUVUAT7uJawc8eQTMHTfa'
const SOL_VAULT = 'BxDCkvgZYRcCAnpywVw5j14AhkXehYvsXoCRiaodUs8s'

const SOL_MINT = 'So11111111111111111111111111111111111111112'
const TOKEN_PROGRAMS = ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb']

// The public RPC rate-limits getTokenAccountsByOwner per method, so the vault is read one call
// at a time, with a retry on 429
async function withRetry(fn, attempts = 5) {
  for (let i = 0; ; i++) {
    try {
      return await fn()
    } catch (e) {
      if (i + 1 >= attempts || !/429|Too many requests/i.test(String(e?.message ?? e))) throw e
      await sleep(2000 * 2 ** i)
    }
  }
}

// UMBRA is counted like every other pooled token: it is shielded by users to hold and
// transact privately, with no lockup, rewards or governance attached
async function tvl(api) {
  const connection = getConnection()
  for (const programId of TOKEN_PROGRAMS) {
    const { value } = await withRetry(() => connection.getParsedTokenAccountsByOwner(new PublicKey(TOKEN_VAULT), { programId: new PublicKey(programId) }))
    for (const { account } of value) {
      const { mint, tokenAmount } = account.data.parsed.info
      api.add(mint, tokenAmount.amount)
    }
    await sleep(800)
  }
  api.add(SOL_MINT, await withRetry(() => connection.getBalance(new PublicKey(SOL_VAULT))))
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the sum of the token balances held by the Umbra V2 shielded pool on Solana, read directly from chain state. V2 custodies every SPL token deposit in token accounts owned by a single vault authority, and native SOL deposits as the lamport balance of a single program-owned vault. Nothing is borrowed, lent or rehypothecated by Umbra itself. The UMBRA balance is ordinary shielded deposits (no lockup, rewards or governance), so it is counted like every other token.',
  solana: { tvl },
}
