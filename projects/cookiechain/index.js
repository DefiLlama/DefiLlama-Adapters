const { PublicKey } = require('@solana/web3.js')
const { getConnection } = require('../helper/solana')

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
const SYSTEM_OWNERS = new Set([
  TOKEN_PROGRAM_ID.toBase58(),
  TOKEN_2022_PROGRAM_ID.toBase58(),
  '11111111111111111111111111111111',
])

const GLOBAL_AUTH_PROGRAMS = [
  'DAMMjDCEFTDkt7ywazZS8GoaLtjb3HaJo3pLbf64xrPY', // CookieBox DAMM - meteora fork
  'DBCg4ugDEztk6MbqHEJvx5a5YGJTj45Jb5NvtQ48Rvsf', // CookieBox DBC - meteora fork
]

const POOL_PROGRAMS = [
  'CLMMmWqTtyNSomqXP3kETJy2SGKPdr31USsm4GfbLyKs', // CookieBox CLMM - orca whirlpool fork?
  'WTzkPUoprVx7PDc1tfKA5sS7k1ynCgU89WtwZhksHX5',  // CookieSwap BAMM - raydium fork?
  'xYBN2zddsqSy41tg1yD9nJScCmqquZnHUyzXBfLEqC8',  // CookieSwap CPAMM - ?
  'DYgGxvJD8GTYQSGFmT4RUab5TJ7W3m7Vrbg2UueNzAq8', // BangSwap CPAMM - raydium fork?
]

function poolAuthorityPDA(programId) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('pool_authority')],
    new PublicKey(programId),
  )[0].toBase58()
}

async function sumOwnedTokens(connection, owner, api) {
  const ownerKey = new PublicKey(owner)
  for (const programId of [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]) {
    const { value } = await connection.getParsedTokenAccountsByOwner(ownerKey, { programId })
    for (const { account } of value) {
      const info = account.data.parsed?.info
      const amount = info?.tokenAmount?.amount
      if (!amount || amount === '0') continue
      api.add(info.mint, amount)
    }
  }
}

// replace w enum + decode w/IDL + sumTokens
async function discoverPoolVaultAuths(connection, programId) {
  // 1. get pools from program (accounts)
  const pools = await connection.getProgramAccounts(new PublicKey(programId), {
    dataSlice: { offset: 0, length: 0 },
  })
  // 2. enum pools
  const auths = new Set()
  for (const { pubkey } of pools) {
    // 3. get latest sig for pool account pubkey
    const sigs = await connection.getSignaturesForAddress(pubkey, { limit: 1 })
    if (!sigs.length) continue
    // 4. get tx from the sig
    const tx = await connection.getTransaction(sigs[0].signature, {
      maxSupportedTransactionVersion: 0,
    })
    // 5. using tx metadata for token balances, add the owner for each token account 
    for (const b of tx?.meta?.preTokenBalances ?? []) {
      if (b.owner && !SYSTEM_OWNERS.has(b.owner)) auths.add(b.owner)
    }
  }
  return [...auths]
}

async function tvl(api) {
  const connection = getConnection('cookiechain')

  for (const programId of GLOBAL_AUTH_PROGRAMS)
    await sumOwnedTokens(connection, poolAuthorityPDA(programId), api)

  for (const programId of POOL_PROGRAMS) {
    const auths = await discoverPoolVaultAuths(connection, programId)
    for (const auth of auths) await sumOwnedTokens(connection, auth, api)
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is calculated by summing token balances held in liquidity pool vault accounts across CookieBox DAMM, CookieBox DBC, CookieBox CLMM, CookieSwap BAMM, CookieSwap CPAMM, and BangSwap CPAMM on Cookie Chain.',
  cookiechain: { tvl },
}
