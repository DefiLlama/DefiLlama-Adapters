const { PublicKey } = require('@solana/web3.js')
const { getConnection } = require('../helper/solana')
const { sleep } = require('../helper/utils')

// Umbra V1: one PDA per shielded pool, each owning that pool's token account
const UMBRA_PROGRAM = 'UMBRAD2ishebJTcgCLkTkNUx1v3GyoAgpTRPeWoLykh'
const POOL_ACCOUNT_SIZE = 176
const POOL_DISCRIMINATOR = 'JGBg3fpzoEY'

// Umbra V2 (program nimBUs55CbjkNfy8UvK48DqFTY7L2mdkmZMQC9mk6LK): a single vault authority PDA
// owns one token account per mint (SPL Token and Token-2022), and SOL is held unwrapped as
// lamports in one program-owned account
const V2_VAULT_AUTHORITY = '2sjnjABJHPEZS8oVdp8nztPBUVUAT7uJawc8eQTMHTfa'
const V2_SOL_VAULT = 'BxDCkvgZYRcCAnpywVw5j14AhkXehYvsXoCRiaodUs8s'

const UMBRA_MINT = 'PRVT6TB7uss3FrUd2D9xs2zqDBsa3GbMJMwCQsgmeta'
const SOL_MINT = 'So11111111111111111111111111111111111111112'
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

// Raw balance per mint across every pool, read once and shared by tvl and staking
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
  const owners = pools.map(a => a.pubkey).concat(new PublicKey(V2_VAULT_AUTHORITY))

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
  const lamports = await withRetry(() => connection.getBalance(new PublicKey(V2_SOL_VAULT)))
  balances[SOL_MINT] = (balances[SOL_MINT] ?? 0n) + BigInt(lamports)
  return balances
}

async function tvl(api) {
  const balances = await getPoolBalances()
  for (const [mint, amount] of Object.entries(balances)) if (mint !== UMBRA_MINT) api.add(mint, amount.toString())
}

async function staking(api) {
  const balances = await getPoolBalances()
  if (balances[UMBRA_MINT]) api.add(UMBRA_MINT, balances[UMBRA_MINT].toString())
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the value of user deposits held in Umbra\'s shielded pools on Solana, read directly from chain state, across both versions. V1: every pool custodies deposits in a single token account owned by the pool PDA. V2: one vault authority PDA owns a token account per mint (SPL Token and Token-2022), and SOL deposits sit as lamports in a single program-owned vault account. Nothing is borrowed, lent or rehypothecated by Umbra itself. Umbra\'s own token is counted under staking where users have deposited it into a pool.',
  solana: { tvl, staking },
}
