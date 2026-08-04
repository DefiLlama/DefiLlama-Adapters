const { PublicKey } = require('@solana/web3.js')
const { getConnection, getTokenAccountBalances } = require('../helper/solana')

const TOKEN_PROGRAMS = [
  new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'),
]

// CookieBox DAMM (Meteora Dynamic AMM v2 / cp_amm fork) and CookieBox DBC (Meteora
// Dynamic Bonding Curve fork) both hold every pool's token vaults under a single
// `pool_authority` PDA, so we enumerate the vault token accounts owned by that PDA.
async function sumPoolAuthorityVaults(connection, api) {
  const programs = [
    'DAMMjDCEFTDkt7ywazZS8GoaLtjb3HaJo3pLbf64xrPY', // CookieBox DAMM
    'DBCg4ugDEztk6MbqHEJvx5a5YGJTj45Jb5NvtQ48Rvsf', // CookieBox DBC
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

// CookieBox CLMM (Orca Whirlpool fork): Whirlpool account dataSize=653,
// discriminator 3f95d10ce1806309, tokenVaultA at offset 133, tokenVaultB at offset 213.
async function getClmmVaults(connection) {
  const accounts = await connection.getProgramAccounts(
    new PublicKey('CLMMmWqTtyNSomqXP3kETJy2SGKPdr31USsm4GfbLyKs'),
    { filters: [{ dataSize: 653 }] },
  )
  const vaults = []
  for (const { account } of accounts) {
    if (account.data.subarray(0, 8).toString('hex') !== '3f95d10ce1806309') continue
    vaults.push(new PublicKey(account.data.slice(133, 165)).toBase58())
    vaults.push(new PublicKey(account.data.slice(213, 245)).toBase58())
  }
  return vaults
}

async function tvl(api) {
  const connection = getConnection(api.chain)

  await sumPoolAuthorityVaults(connection, api)

  const vaults = await getClmmVaults(connection)
  if (vaults.length) {
    const balances = await getTokenAccountBalances(vaults, { chain: api.chain, allowError: true })
    for (const [mint, amount] of Object.entries(balances)) api.add(mint, amount)
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is calculated by summing token balances held in liquidity pool vault accounts across CookieBox DAMM, CookieBox DBC, and CookieBox CLMM on Cookie Chain.',
  cookiechain: { tvl },
}
