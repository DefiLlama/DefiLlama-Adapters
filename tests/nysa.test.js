const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const { beforeEach, test } = require('node:test')
const { PublicKey } = require('@solana/web3.js')
const sdk = require('@defillama/sdk')
const adapter = require('../projects/nysa')

const PROGRAM = 'KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD'
const MARKET = 'F4uLsGZT4YnHDcemtoYDz2LBZKLmwTB1wzkwS6oqygvy'
const USDY = 'A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6'
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const USDY_RESERVE = 'rpTGWR3JDjjPfXLCg5Fx1GpSdUxPt1pxW7fwXGUT6js'
const USDC_RESERVE = 'GQr5hXuRgHAmguh6EqcpeJXrMyqCQch4P6XkSvawwNk2'
const USDY_VAULT = 'AVxf9dXFj5M7xCM7SU6cRM2FnUtZyeWcqHSJVt5Fbdsk'
const USDC_VAULT = '68YwkFhagT33k8485VtX1MhMYpab97c1MjpWcXFuTYea'
const Q60 = 1n << 60n

/**
 * Write a public key into an account fixture at the specified byte offset.
 * @param {Buffer} data Mutable account data.
 * @param {number} offset Start of the 32-byte public key field.
 * @param {string} value Base58-encoded public key.
 * @returns {void}
 */
function pubkey(data, offset, value) {
  new PublicKey(value).toBuffer().copy(data, offset)
}

/**
 * Build a binary Kamino Reserve fixture for decoding with the real on-chain IDL.
 * @param {string} mint Underlying token mint.
 * @param {string} vault Liquidity supply vault address.
 * @param {bigint} available Cached available liquidity in raw token units.
 * @returns {object} Account data and Kamino program owner for the mocked RPC.
 */
function reserve(mint, vault, available) {
  const data = Buffer.alloc(8624)
  createHash('sha256').update('account:Reserve').digest().copy(data, 0, 0, 8)
  data.writeBigUInt64LE(1n, 8)
  pubkey(data, 32, MARKET)
  pubkey(data, 128, mint)
  pubkey(data, 160, vault)
  data.writeBigUInt64LE(available, 224)
  data.writeBigUInt64LE(6n, 272)
  return { data, owner: PROGRAM }
}

/**
 * Build an initialized SPL Token fixture for the real token account decoder.
 * @param {string} mint Underlying token mint.
 * @param {bigint} amount Vault balance in raw token units.
 * @returns {object} Account data and SPL Token program owner for the mocked RPC.
 */
function tokenAccount(mint, amount) {
  const data = Buffer.alloc(165)
  pubkey(data, 0, mint)
  pubkey(data, 32, 'E1AHokuxNSR123SD4kQGsKvAFLFFcBhdbptf2EsubToH')
  data.writeBigUInt64LE(amount, 64)
  data[108] = 1 // initialized
  return { data, owner: sdk.chains.svm.TOKEN_PROGRAM_ID }
}

/**
 * Set a reserve fixture's unsigned 128-bit Q60 borrowed amount.
 * @param {object} account Mutable Reserve account fixture.
 * @param {bigint} value Debt in Q60-scaled raw token units.
 * @returns {void}
 */
function setDebt(account, value) {
  account.data.writeBigUInt64LE(value & ((1n << 64n) - 1n), 232)
  account.data.writeBigUInt64LE(value >> 64n, 240)
}

let accounts
beforeEach((t) => {
  accounts = new Map([
    [USDY_RESERVE, reserve(USDY, USDY_VAULT, 1090000n)],
    [USDC_RESERVE, reserve(USDC, USDC_VAULT, 6258228n)],
    [USDY_VAULT, tokenAccount(USDY, 1090000n)],
    [USDC_VAULT, tokenAccount(USDC, 6258228n)],
  ])
  // Replace only the external JSON-RPC boundary; no live network is needed.
  t.mock.method(sdk.chains.rpc, 'jsonRpc', async (method, [addresses]) => {
    assert.equal(method, 'getMultipleAccounts')
    return { context: { slot: 454805242 }, value: addresses.map((address) => {
      const account = accounts.get(address)
      return account ? {
        ...account,
        data: [account.data.toString('base64'), 'base64'],
        lamports: 1,
        executable: false,
        rentEpoch: 0,
        space: account.data.length,
      } : null
    }) }
  })
})

/**
 * Run an adapter bucket using the real ChainApi and mocked RPC accounts.
 * @param {string} bucket Adapter handler to invoke: tvl or borrowed.
 * @returns {Promise<object>} Raw balances keyed by chain-prefixed token mint.
 */
async function balances(bucket) {
  const api = new sdk.ChainApi({ chain: 'solana', timestamp: Math.floor(Date.now() / 1000) })
  await adapter.solana[bucket](api)
  return api.getBalances()
}

test('TVL uses actual vault balances, excluding cached liquidity and borrowed assets', async () => {
  accounts.get(USDC_RESERVE).data.writeBigUInt64LE(999999999n, 224)
  setDebt(accounts.get(USDC_RESERVE), 2000000n * Q60)
  assert.deepEqual(await balances('tvl'), {
    [`solana:${USDY}`]: '1090000',
    [`solana:${USDC}`]: '6258228',
  })
})

test('borrowed converts Q60 debt into raw units and truncates sub-atomic dust', async () => {
  setDebt(accounts.get(USDY_RESERVE), 1162528n)
  setDebt(accounts.get(USDC_RESERVE), 123456789n * Q60 + Q60 * 3n / 4n)
  const result = await balances('borrowed')
  assert.equal(result[`solana:${USDC}`], '123456789')
  assert.equal(BigInt(result[`solana:${USDY}`] || 0), 0n)
})

test('borrowed preserves amounts above JavaScript safe integer precision', async () => {
  setDebt(accounts.get(USDC_RESERVE), 9007199254740993n * Q60)
  assert.equal((await balances('borrowed'))[`solana:${USDC}`], '9007199254740993')
})

const invalidReserves = [
  ['missing reserve', () => accounts.delete(USDY_RESERVE), /reserve/i],
  ['wrong program owner', () => { accounts.get(USDY_RESERVE).owner = sdk.chains.svm.TOKEN_PROGRAM_ID }, /owner|program/i],
  ['wrong lending market', () => pubkey(accounts.get(USDY_RESERVE).data, 32, USDC), /market/i],
  ['wrong underlying mint', () => pubkey(accounts.get(USDY_RESERVE).data, 128, USDC), /mint/i],
  ['invalid account discriminator', () => { accounts.get(USDY_RESERVE).data[0] ^= 255 }, /discriminator/i],
]

for (const bucket of ['tvl', 'borrowed']) {
  for (const [name, invalidate, error] of invalidReserves) {
    test(`${bucket} rejects a ${name} instead of reporting partial balances`, async () => {
      invalidate()
      await assert.rejects(balances(bucket), error)
    })
  }
}

test('TVL rejects a missing supply vault instead of undercounting', async () => {
  accounts.delete(USDC_VAULT)
  await assert.rejects(balances('tvl'), /account/i)
})
