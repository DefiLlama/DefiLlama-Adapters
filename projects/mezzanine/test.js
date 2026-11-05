// Run: node projects/mezzanine/test.js
const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const { PublicKey } = require('@solana/web3.js')
const solana = require('../helper/solana')

const OWNER = new PublicKey('5eP1ZevYtTNxQs5yzRqvpDgeZmZdcsJEscVLQAFYVMsV')
const PROGRAM = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD')
const USDC = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
const AUTO = new PublicKey('GNE6oDS6jHrfaV3GQVVCCp37fDnT7PiPuewMKBj2bqNm')
const SF = 2n ** 60n
const putKey = (data, offset, key) => key.toBuffer().copy(data, offset)
function putUint(data, offset, value, words = 2) {
  for (let i = 0; i < words; i++) {
    data.writeBigUInt64LE(value & ((1n << 64n) - 1n), offset + i * 8)
    value >>= 64n
  }
}
function account(name, size) {
  const data = Buffer.alloc(size)
  createHash('sha256').update(`account:${name}`).digest().copy(data, 0, 0, 8)
  return { owner: PROGRAM, data }
}
function api() {
  const balances = {}
  return { balances, add(mint, amount) { balances[mint] = (balances[mint] ?? 0n) + BigInt(amount) } }
}

async function main() {
  const market = PublicKey.unique()
  const reserveKey = PublicKey.unique()
  const reserve = account('Reserve', 8624)
  putKey(reserve.data, 32, market)
  putKey(reserve.data, 128, USDC)
  reserve.data.writeBigUInt64LE(800n, 224)
  putUint(reserve.data, 232, 250n * SF)
  putUint(reserve.data, 344, 20n * SF)
  putUint(reserve.data, 360, 10n * SF)
  putUint(reserve.data, 376, 20n * SF)
  reserve.data.writeBigUInt64LE(500n, 2592) // 1000 underlying / 500 shares = 2
  putUint(reserve.data, 296, 3n * SF, 4)
  const obligation = account('Obligation', 3344)
  putKey(obligation.data, 32, market)
  putKey(obligation.data, 64, OWNER)
  // Use the last slot too: discovery must not stop at gaps or require a market list.
  for (const slot of [0, 7]) {
    putKey(obligation.data, 96 + slot * 136, reserveKey)
    obligation.data.writeBigUInt64LE(25n, 96 + slot * 136 + 32)
  }
  putKey(obligation.data, 1208 + 4 * 200, reserveKey)
  putUint(obligation.data, 1208 + 4 * 200 + 32, 2n * SF, 4)
  putUint(obligation.data, 1208 + 4 * 200 + 88, 10n * SF + 1n) // refreshed debt rounds to 16
  let obligations = [{ account: obligation }, { account: obligation }]
  let accounts = [reserve]
  let failToken2022 = false
  const connection = {
    async getProgramAccounts(program, { filters }) {
      assert(program.equals(PROGRAM))
      assert.deepEqual(filters, [{ memcmp: { offset: 64, bytes: OWNER.toBase58() } }])
      return obligations
    },
    async getMultipleAccountsInfo(keys) {
      assert.deepEqual(keys, [reserveKey])
      return accounts
    },
    async getParsedTokenAccountsByOwner(owner, { programId }) {
      assert(owner.equals(OWNER))
      const is2022 = programId.equals(solana.TOKEN_2022_PROGRAM_ID)
      if (is2022 && failToken2022) throw new Error('RPC failed')
      return { value: [{ account: { data: { parsed: { info: {
        mint: (is2022 ? AUTO : USDC).toBase58(), tokenAmount: { amount: is2022 ? '7' : '1' },
      } } } } }] }
    },
  }
  solana.getConnection = () => connection
  const adapter = require('./solana')
  const net = api()
  await adapter.tvl(net)
  assert.deepEqual(net.balances, { [USDC]: 169n, [AUTO]: 7n }) // 1 + 2*100 - 2*16
  const debt = api()
  await adapter.borrowed(debt)
  assert.deepEqual(debt.balances, { [USDC]: 32n })
  accounts = [null]
  await assert.rejects(adapter.tvl(api()), /invalid Kamino Reserve/)
  accounts = [reserve]
  putUint(reserve.data, 296, SF, 4)
  await assert.rejects(adapter.borrowed(api()), /invalid Kamino borrow rate/)
  putUint(reserve.data, 296, 3n * SF, 4)
  obligation.data[0] ^= 1
  await assert.rejects(adapter.tvl(api()), /invalid Kamino Obligation/)
  obligations = []
  const idle = api()
  await adapter.tvl(idle)
  assert.deepEqual(idle.balances, { [USDC]: 1n, [AUTO]: 7n })
  failToken2022 = true
  await assert.rejects(adapter.tvl(api()), /RPC failed/)
  console.log('Solana net holdings, debt, discovery, rounding, and RPC failure checks passed')
}

main().catch(error => { console.error(error); process.exitCode = 1 })
