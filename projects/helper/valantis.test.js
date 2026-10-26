const { test } = require('node:test')
const assert = require('node:assert/strict')
const { restakingShares, stexNav, readStex, readRestaking } = require('./valantis')

test('escrow excludes seed and unvested rewards but keeps pending claims', () => {
  assert.deepEqual(restakingShares(['1000', '100', '300', '700'], '10'),
    { active: 900n, pending: 300n, userClaims: 1200n, custody: 2000n })
  assert.equal(restakingShares(['1100', '100', '300', '600'], '10').userClaims, 1290n)
})

test('empty / seed-only escrow and invalid ownership', () => {
  assert.equal(restakingShares(['0', '0', '0', '10'], '0').userClaims, 0n)
  assert.equal(restakingShares(['100', '10', '0', '10'], '10').userClaims, 0n)
  assert.throws(() => restakingShares(['100', '0', '0', '0'], '0'))
  assert.throws(() => restakingShares(['100', '10', '0', '0'], '11'))
})

test('STEX includes lending, pending unstaking and only unreserved native surplus', () => {
  const result = stexNav({ reserve0: 100n, reserve1: 200n, lending: 300n, converted0: 150n,
    pending: 50n, nativeBalance: 100n, claimable: 20n, pendingBefore: 30n })
  assert.deepEqual(result, { nav: 650n, liveStHype: 100n, native: 550n })
})

test('token-preserving liability allocation is nonnegative and reconciles to NAV', () => {
  const result = stexNav({ reserve0: 100n, reserve1: 20n, lending: 0n, converted0: 100n,
    pending: 80n, nativeBalance: 0n, claimable: 0n, pendingBefore: 0n })
  assert.deepEqual(result, { nav: 40n, liveStHype: 40n, native: 0n })
  assert.throws(() => stexNav({ reserve0: 0n, reserve1: 0n, lending: 0n, converted0: 0n,
    pending: 1n, nativeBalance: 0n, claimable: 0n, pendingBefore: 0n }))
})

test('predeployment guards do not call nonexistent contracts', async () => {
  const api = { getBlock: async () => 1 }
  assert.equal((await readStex(api, 'unused', 10)).nav, 0n)
  assert.equal(await readRestaking(api), 0n)
})

test('STEX resolves mutable modules without SDK caching and supports the original storage getter', async () => {
  const original = '0x40ba056b004edd0b572509a1276fd8530cf2bb7f'
  let module = original
  const getters = []
  const api = {
    getBlock: async () => 2000000,
    batchCall: async (calls) => {
      if (calls[0].abi === 'address:pool') {
        assert.equal(calls[1].skipCache, true)
        return ['pool', module]
      }
      return [['100', '200'], '300', '50', '50', '20']
    },
    getGasTokenBalance: async () => '100',
    call: async ({ abi, params }) => {
      if (params) { assert.deepEqual(params, ['150']); return '150' }
      getters.push(abi)
      return '30'
    },
  }
  assert.equal((await readStex(api, 'stex', 10)).nav, 650n)
  module = '0x0000000000000000000000000000000000000010'
  assert.equal((await readStex(api, 'stex', 10)).nav, 650n)
  assert.deepEqual(getters, ['uint256:_amountToken1PendingLPWithdrawal', 'uint256:amountToken1PendingLPWithdrawalBeforeUpdate'])
})

test('escrow converts user claims once and rejects unreconciled custody', async () => {
  let custody = '2000'
  const api = {
    getBlock: async () => 48000000,
    batchCall: async () => [['1000', '100', '300', '700'], ['10', '100', '0'], custody],
    call: async ({ params }) => { assert.deepEqual(params, ['1200']); return '120' },
  }
  assert.equal(await readRestaking(api), 120n)
  custody = '2001'
  await assert.rejects(readRestaking(api), /custody does not reconcile/)
})
