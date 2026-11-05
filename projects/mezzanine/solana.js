const { PublicKey } = require('@solana/web3.js')
const { BorshAccountsCoder } = require('@project-serum/anchor')
const { svm } = require('@defillama/sdk').chains
const { getMultipleAccounts, sumTokens2 } = require('../helper/solana')
const kaminoIdl = require('../kamino-lending/kamino-lending-idl.json')

const OWNER = '5eP1ZevYtTNxQs5yzRqvpDgeZmZdcsJEscVLQAFYVMsV'
const KLEND = 'KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD'
const OBLIGATION_SIZE = 3344
const SF = 2n ** 60n
const coder = new BorshAccountsCoder(kaminoIdl)
const OBLIGATION_DISCRIMINATOR = BorshAccountsCoder.accountDiscriminator('Obligation')
const big = bn => BigInt(bn.toString())
const bigFraction = ({ value }) => value.reduce((acc, word, i) => acc + (big(word) << BigInt(64 * i)), 0n)
const keyAt = (data, offset) => new PublicKey(data.subarray(offset, offset + 32)).toBase58()
const uint = (data, offset, words = 2) => {
  let value = 0n
  for (let i = words - 1; i >= 0; i--) value = (value << 64n) + data.readBigUInt64LE(offset + i * 8)
  return value
}

async function positions(api) {
  const obligations = await svm.getProgramAccounts({
    chain: api.chain, programId: KLEND,
    filters: [{ dataSize: OBLIGATION_SIZE }, { memcmp: { offset: 64, bytes: OWNER } }],
  })
  const deposits = []
  const borrows = []
  // Obligation is not in the shared kamino IDL, so it is read by offset from klend's zero-copy layout:
  // deposits[8] at 96 (136 bytes each), borrows[5] at 1208 (200 bytes each). SF is U68F60; BSF is a LE U256.
  // https://github.com/Kamino-Finance/klend/blob/77e81854909ab7ffea3a2e898b2554d96e07daac/programs/klend/src/state/obligation.rs
  for (const { account } of obligations) {
    const data = Buffer.from(account.data[0], 'base64')
    if (account.owner !== KLEND || data.length !== OBLIGATION_SIZE || !data.subarray(0, 8).equals(OBLIGATION_DISCRIMINATOR))
      throw new Error('mezzanine: invalid Kamino Obligation account')
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
  const accounts = await getMultipleAccounts(keys, { api })
  const reserves = Object.fromEntries(keys.map((key, i) => {
    const account = accounts[i]
    if (!account || account.owner.toString() !== KLEND) throw new Error(`mezzanine: invalid Kamino Reserve ${key}`)
    return [key, coder.decode('Reserve', account.data)]
  }))
  const resolve = position => {
    const reserve = reserves[position.reserve]
    if (reserve.lendingMarket.toString() !== position.market) throw new Error('mezzanine: reserve market mismatch')
    return reserve
  }
  return {
    deposits: deposits.map(p => {
      const { liquidity, collateral } = resolve(p)
      // Same ReserveLiquidity.total_supply() fee deductions as klend's collateral exchange rate.
      const total = big(liquidity.availableAmount) * SF + big(liquidity.borrowedAmountSf)
        - big(liquidity.accumulatedProtocolFeesSf) - big(liquidity.accumulatedReferrerFeesSf) - big(liquidity.pendingReferrerFeesSf)
      const supply = big(collateral.mintTotalSupply)
      if (!supply || total < 0n) throw new Error('mezzanine: invalid Kamino collateral exchange rate')
      return { mint: liquidity.mintPubkey.toString(), amount: p.amount * total / (supply * SF) }
    }),
    borrows: borrows.map(p => {
      const { liquidity } = resolve(p)
      const rate = bigFraction(liquidity.cumulativeBorrowRateBsf)
      if (!p.rate || rate < p.rate) throw new Error('mezzanine: invalid Kamino borrow rate')
      // Refresh obligation debt to the reserve's cumulative rate; round debt up.
      const denominator = p.rate * SF
      return { mint: liquidity.mintPubkey.toString(), amount: (p.amount * rate + denominator - 1n) / denominator }
    }),
  }
}

async function tvl(api) {
  const { deposits, borrows } = await positions(api)
  // All SPL and Token-2022 balances of the wallet. Native SOL is not queried: gas, not strategy capital.
  await sumTokens2({ api, owners: [OWNER] })
  deposits.forEach(p => api.add(p.mint, p.amount.toString()))
  borrows.forEach(p => api.add(p.mint, (-p.amount).toString()))
}

async function borrowed(api) {
  const { borrows } = await positions(api)
  borrows.forEach(p => api.add(p.mint, p.amount.toString()))
}

module.exports = { tvl, borrowed }
