const { PublicKey } = require('@solana/web3.js')
const { getConnection, getTokenAccountBalances } = require('../helper/solana')

const TOKEN_PROGRAMS = [
  new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'),
]

async function sumMeteoraDammDbc(connection, api) {
  const programs = [
    'DAMMjDCEFTDkt7ywazZS8GoaLtjb3HaJo3pLbf64xrPY', // CookieBox DAMM (Meteora Dynamic AMM v2)
    'DBCg4ugDEztk6MbqHEJvx5a5YGJTj45Jb5NvtQ48Rvsf', // CookieBox DBC (Meteora Dynamic Bonding Curve)
  ]
  for (const programId of programs) {
    const [auth] = PublicKey.findProgramAddressSync(
      [Buffer.from('pool_authority')],
      new PublicKey(programId),
    )
    for (const tokenProgram of TOKEN_PROGRAMS) {
      const { value } = await connection.getParsedTokenAccountsByOwner(auth, { programId: tokenProgram })
      for (const { account } of value) {
        const info = account.data.parsed?.info
        const amount = info?.tokenAmount?.amount
        if (!amount || amount === '0') continue
        api.add(info.mint, amount)
      }
    }
  }
}

async function getOrcaWhirlpoolVaults(connection) {
  // CookieBox CLMM (Orca Whirlpool)
  const accounts = await connection.getProgramAccounts(
    new PublicKey('CLMMmWqTtyNSomqXP3kETJy2SGKPdr31USsm4GfbLyKs'),
  )
  const vaults = []
  for (const { account } of accounts) {
    if (account.data.subarray(0, 8).toString('hex') !== '3f95d10ce1806309') continue
    vaults.push(new PublicKey(account.data.slice(133, 165)).toBase58())
    vaults.push(new PublicKey(account.data.slice(213, 245)).toBase58())
  }
  return vaults
}

async function getRaydiumPoolVaults(connection) {
  const pools = [
    { programId: 'WTzkPUoprVx7PDc1tfKA5sS7k1ynCgU89WtwZhksHX5', vaultA: 137, vaultB: 169 }, // CookieSwap BAMM (Raydium CLMM)
    { programId: 'DYgGxvJD8GTYQSGFmT4RUab5TJ7W3m7Vrbg2UueNzAq8', vaultA:  72, vaultB: 104 }, // BangCPAMM (Raydium CPMM)
  ]
  const vaults = []
  for (const { programId, vaultA, vaultB } of pools) {
    const accounts = await connection.getProgramAccounts(new PublicKey(programId))
    for (const { account } of accounts) {
      if (account.data.subarray(0, 8).toString('hex') !== 'f7ede3f5d7c3de46') continue
      if (account.data.length < vaultB + 32) continue
      vaults.push(new PublicKey(account.data.slice(vaultA, vaultA + 32)).toBase58())
      vaults.push(new PublicKey(account.data.slice(vaultB, vaultB + 32)).toBase58())
    }
  }
  return vaults
}

async function getSplTokenSwapVaults(connection) {
  // CookieSwap CPAMM (Token-Swap)
  const accounts = await connection.getProgramAccounts(
    new PublicKey('xYBN2zddsqSy41tg1yD9nJScCmqquZnHUyzXBfLEqC8'),
  )
  const vaults = []
  for (const { account } of accounts) {
    if (account.data[0] !== 0x01 || account.data[1] !== 0x01) continue
    vaults.push(new PublicKey(account.data.slice(35, 67)).toBase58())
    vaults.push(new PublicKey(account.data.slice(67, 99)).toBase58())
  }
  return vaults
}

async function tvl(api) {
  const connection = getConnection('cookiechain')

  await sumMeteoraDammDbc(connection, api)

  const orcaVaults = await getOrcaWhirlpoolVaults(connection)
  const raydiumVaults = await getRaydiumPoolVaults(connection)
  const tokenSwapVaults = await getSplTokenSwapVaults(connection)
  const vaults = [...orcaVaults, ...raydiumVaults, ...tokenSwapVaults]
  if (vaults.length) {
    const balances = await getTokenAccountBalances(vaults, { chain: 'cookiechain', allowError: true })
    for (const [mint, amount] of Object.entries(balances)) api.add(mint, amount)
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is calculated by summing token balances held in liquidity pool vault accounts across CookieBox DAMM, CookieBox DBC, CookieBox CLMM, CookieSwap BAMM, CookieSwap CPAMM, and BangSwap CPAMM on Cookie Chain.',
  cookiechain: { tvl },
}