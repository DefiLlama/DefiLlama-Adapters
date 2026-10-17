const { PublicKey } = require('@solana/web3.js')
const { getConnection } = require('../helper/solana')
const { sleep } = require('../helper/utils')

// Umbra V1: one PDA per shielded pool, each owning that pool's token account
const UMBRA_PROGRAM = 'UMBRAD2ishebJTcgCLkTkNUx1v3GyoAgpTRPeWoLykh'
const POOL_ACCOUNT_SIZE = 176
const POOL_DISCRIMINATOR = 'JGBg3fpzoEY'

const TOKEN_PROGRAMS = ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb']

// The public RPC rate-limits getTokenAccountsByOwner per method, so owners are read one call
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

// Raw balance per mint across every pool
let balancesPromise
function getPoolBalances() {
  if (!balancesPromise) balancesPromise = readPoolBalances().catch((e) => { balancesPromise = undefined; throw e })
  return balancesPromise
}

async function readPoolBalances() {
  const connection = getConnection()
  const pools = await withRetry(() => connection.getProgramAccounts(new PublicKey(UMBRA_PROGRAM), {
    filters: [{ dataSize: POOL_ACCOUNT_SIZE }, { memcmp: { offset: 0, bytes: POOL_DISCRIMINATOR } }],
    dataSlice: { offset: 0, length: 0 },
  }))
  const owners = pools.map(a => a.pubkey)

  const balances = {}
  for (const owner of owners) {
    for (const programId of TOKEN_PROGRAMS) {
      const { value } = await withRetry(() => connection.getParsedTokenAccountsByOwner(owner, { programId: new PublicKey(programId) }))
      for (const { account } of value) {
        const { mint, tokenAmount } = account.data.parsed.info
        balances[mint] = (balances[mint] ?? 0n) + BigInt(tokenAmount.amount)
      }
      await sleep(800)
    }
  }
  return balances
}

// UMBRA is counted like every other pooled token: it is shielded by users to hold and
// transact privately, with no lockup, rewards or governance attached
async function tvl(api) {
  const balances = await getPoolBalances()
  for (const [mint, amount] of Object.entries(balances)) api.add(mint, amount.toString())
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the sum of the SPL token balances held in the token account of each Umbra shielded pool on Solana, read directly from chain state. Every pool custodies user deposits in a single token account owned by the pool PDA, so the balance of that account is the pool\'s outstanding deposits. Nothing is borrowed, lent or rehypothecated by Umbra itself. The UMBRA pool is an ordinary shielded pool (no lockup, rewards or governance), so it is counted like every other pool.',
  solana: { tvl },
}
