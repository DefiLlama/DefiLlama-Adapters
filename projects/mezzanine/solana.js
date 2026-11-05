const { createHash } = require('node:crypto')
const { PublicKey } = require('@solana/web3.js')
const { getConnection, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } = require('../helper/solana')

const OWNER = '5eP1ZevYtTNxQs5yzRqvpDgeZmZdcsJEscVLQAFYVMsV'
const KLEND = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD')
const SF = 2n ** 60n
const discriminator = name => createHash('sha256').update(`account:${name}`).digest().subarray(0, 8)
const keyAt = (data, offset) => new PublicKey(data.subarray(offset, offset + 32)).toBase58()
const uint = (data, offset, words = 2) => {
  let value = 0n
  for (let i = words - 1; i >= 0; i--) value = (value << 64n) + data.readBigUInt64LE(offset + i * 8)
  return value
}

function checkedData(account, name, size) {
  if (!account || !account.owner.equals(KLEND) || account.data.length !== size || !account.data.subarray(0, 8).equals(discriminator(name)))
    throw new Error(`mezzanine: invalid Kamino ${name} account`)
  return account.data
}

async function positions(connection) {
  const obligations = await connection.getProgramAccounts(KLEND, {
    filters: [{ memcmp: { offset: 64, bytes: OWNER } }],
  })
  const deposits = []
  const borrows = []
  // Kamino klend zero-copy layouts: Obligation deposits[8] at 96 (136 bytes each),
  // borrows[5] at 1208 (200 bytes each). SF is U68F60; borrow-rate BSF is a LE U256.
  // https://github.com/Kamino-Finance/klend/blob/77e81854909ab7ffea3a2e898b2554d96e07daac/programs/klend/src/state/obligation.rs
  for (const { account } of obligations) {
    const data = checkedData(account, 'Obligation', 3344)
    if (keyAt(data, 64) !== OWNER) throw new Error('mezzanine: unexpected obligation owner')
    const market = keyAt(data, 32)
    for (let i = 0; i < 8; i++) {
      const offset = 96 + i * 136
      const amount = data.readBigUInt64LE(offset + 32)
      if (amount) deposits.push({ reserve: keyAt(data, offset), amount, market })
    }
    for (let i = 0; i < 5; i++) {
      const offset = 1208 + i * 200
      const amount = uint(data, offset + 88)
      if (amount) borrows.push({ reserve: keyAt(data, offset), amount, rate: uint(data, offset + 32, 4), market })
    }
  }
  const keys = [...new Set([...deposits, ...borrows].map(p => p.reserve))]
  if (!keys.length) return { deposits: [], borrows: [] }
  const accounts = await connection.getMultipleAccountsInfo(keys.map(key => new PublicKey(key)))
  const reserves = Object.fromEntries(keys.map((key, i) => [key, checkedData(accounts[i], 'Reserve', 8624)]))
  const resolve = position => {
    const data = reserves[position.reserve]
    if (keyAt(data, 32) !== position.market) throw new Error('mezzanine: reserve market mismatch')
    return data
  }
  // Same ReserveLiquidity.total_supply() fee deductions as klend's exchange rate.
  // Reserve layout shared with projects/huma-v2: mint 128, supply 2592.
  return {
    deposits: deposits.map(p => {
      const data = resolve(p)
      const liquidity = data.readBigUInt64LE(224) * SF + uint(data, 232)
        - uint(data, 344) - uint(data, 360) - uint(data, 376)
      const supply = data.readBigUInt64LE(2592)
      if (!supply || liquidity < 0n) throw new Error('mezzanine: invalid Kamino collateral exchange rate')
      return { mint: keyAt(data, 128), amount: p.amount * liquidity / (supply * SF) }
    }),
    borrows: borrows.map(p => {
      const data = resolve(p)
      const rate = uint(data, 296, 4)
      if (!p.rate || rate < p.rate) throw new Error('mezzanine: invalid Kamino borrow rate')
      // Refresh obligation debt to the reserve's cumulative rate; round debt up.
      const denominator = p.rate * SF
      return { mint: keyAt(data, 128), amount: (p.amount * rate + denominator - 1n) / denominator }
    }),
  }
}

async function tvl(api) {
  const connection = getConnection()
  const { deposits, borrows } = await positions(connection)
  // Query both SPL programs without dust filtering or suppressing failed RPC reads.
  // Native SOL is never queried: it is reserved for gas, not strategy capital.
  for (const programId of [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]) {
    const { value } = await connection.getParsedTokenAccountsByOwner(new PublicKey(OWNER), { programId })
    for (const { account } of value) {
      const { mint, tokenAmount } = account.data.parsed.info
      if (BigInt(tokenAmount.amount)) api.add(mint, tokenAmount.amount)
    }
  }
  deposits.forEach(p => api.add(p.mint, p.amount.toString()))
  borrows.forEach(p => api.add(p.mint, (-p.amount).toString()))
}

async function borrowed(api) {
  const { borrows } = await positions(getConnection())
  borrows.forEach(p => api.add(p.mint, p.amount.toString()))
}

module.exports = { tvl, borrowed }
