const { PublicKey } = require('@solana/web3.js')
const { getConnection, getTokenAccountBalances } = require('../helper/solana')

async function getRaydiumPoolVaults(connection) {
  const pools = [
    { programId: 'WTzkPUoprVx7PDc1tfKA5sS7k1ynCgU89WtwZhksHX5', vaultA: 137, vaultB: 169 }, // CookieSwap BAMM (Raydium CLMM)
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
    if (account.data.length < 99) continue
    vaults.push(new PublicKey(account.data.slice(35, 67)).toBase58())
    vaults.push(new PublicKey(account.data.slice(67, 99)).toBase58())
  }
  return vaults
}

async function tvl(api) {
  const connection = getConnection(api.chain)

  const raydiumVaults = await getRaydiumPoolVaults(connection)
  const tokenSwapVaults = await getSplTokenSwapVaults(connection)
  const vaults = [...raydiumVaults, ...tokenSwapVaults]
  if (vaults.length) {
    const balances = await getTokenAccountBalances(vaults, { chain: api.chain, allowError: true })
    for (const [mint, amount] of Object.entries(balances)) api.add(mint, amount)
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is calculated by summing token balances held in liquidity pool vault accounts across CookieSwap BAMM and CookieSwap CPAMM on Cookie Chain.',
  cookiechain: { tvl },
}
