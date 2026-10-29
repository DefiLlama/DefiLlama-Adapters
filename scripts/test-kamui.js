const { test } = require('node:test')
const assert = require('node:assert/strict')
const { ethereum: { tvl } } = require('../projects/kamui')
const { getCuratorTvl } = require('../projects/helper/curators')

const PUBLIC = ['0xcda323c2df692d989b24ba51d0acca924cf9a344', '0xa5ae405242f42c47996a0c6857ff10a77f9bdee6', '0x9e0db8f43bb91e2148b0db920e21370525cf3aab']
const KGEAR = '0xe9fc51df9168361c9cf00383c644ae9dcf2ad6b0'
const SAFE = '0x3795801006c74ecd1b5e55425c527d30a7e3bea1'
const ACCOUNT = '0x57eeddd11bfe8b15bcfcba7235c4bd976dcae539'
const FOREIGN = '0x1111111111111111111111111111111111111111'
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const FRXUSD = '0xcacd6fd266af91b8aed52accc382b4e165586e29'
const MGLOBAL = '0x7433806912eae67919e66aea853d46fa0aef98a8'
const MGLOBAL_NAV = '0x66aa9fcd63df74e1f67a9452e6e59fbc67f75e38'
const PHANTOM = '0x5d1c51ae5219deddefad70821d006fb40a4457f5'

function fixture({ block = 26297593, zero = false, fail = null, nested = false } = {}) {
  let pinned = false
  let usd = 0
  const balances = {}
  const reads = []
  function read({ target, abi, params = [] }, permitFailure) {
    assert.ok(pinned, 'every read must follow block pinning')
    target = target.toLowerCase()
    reads.push({ target, abi, params })
    const publicIndex = PUBLIC.indexOf(target)
    if (publicIndex === 0 && ((fail === 'public-assets' && abi === 'address:asset') || (fail === 'public-total' && abi.includes('totalAssets')))) {
      if (permitFailure) return null
      throw new Error('public vault read failed')
    }
    if (abi.includes('totalAssets')) {
      assert.notEqual(target, KGEAR, 'kGear net assets must not be booked')
      assert.ok(publicIndex >= 0)
      return String((publicIndex + 1) * 100e6)
    }
    if (abi === 'address:asset') return USDC
    if (abi === 'address:safe') return target === KGEAR ? SAFE : `safe-${publicIndex}`
    if (abi.includes('creditAccounts()')) return target.startsWith('0x7d16') ? [ACCOUNT, ACCOUNT.toUpperCase(), FOREIGN] : []
    if (abi.includes('getBorrowerOrRevert')) {
      if (fail === 'borrower') throw new Error('borrower read failed')
      return params[0] === ACCOUNT ? SAFE : FOREIGN
    }
    if (abi.includes('balanceOf')) {
      const owner = params[0].toLowerCase()
      assert.notEqual(owner, FOREIGN, 'another borrower must not be counted')
      if (target === KGEAR) return nested && owner === 'safe-0' ? '5000000' : '0'
      if (PUBLIC.includes(target)) return '0'
      if (fail === 'balance') throw new Error('balance read failed')
      if (zero) return '0'
      if (target === USDC) return String((owner === SAFE ? 10 : 3) * 1e6)
      if (target === FRXUSD) return String(BigInt(owner === SAFE ? 20 : 5) * 10n ** 18n)
      if (target === MGLOBAL) return String(BigInt(owner === SAFE ? 10 : 100) * 10n ** 18n)
      if (target === PHANTOM) return owner === ACCOUNT ? String(7n * 10n ** 18n) : '0'
      return '0'
    }
    assert.ok(!abi.includes('mTokenDataFeed') && !abi.includes('getDataInBase18'), 'mint-price feeds must not value collateral')
    if (abi.includes('latestRoundData')) {
      assert.equal(target, MGLOBAL_NAV)
      return { answer: fail === 'price' ? '0' : '120000000', updatedAt: fail === 'timestamp' ? '0' : '1792755659' }
    }
    if (abi.includes('convertToAssets')) return '7000000'
    if (permitFailure) return null
    throw new Error(`Unexpected ABI: ${abi}`)
  }
  return {
    chain: 'ethereum', reads,
    getBlock: async () => { pinned = true; return block },
    call: async params => read(params, false),
    multiCall: async ({ calls, abi, permitFailure }) => calls.map(call => read({ ...(typeof call === 'string' ? { target: call } : call), abi }, permitFailure)),
    add: (token, value) => { const key = token.toLowerCase(); balances[key] = (balances[key] ?? 0n) + BigInt(value) },
    addUSDValue: value => { usd += value },
    getBalances: () => ({ ...balances, usd }),
  }
}

test('adds gross Safe and owned account assets once, before debt, at one block', async () => {
  const api = fixture()
  const balances = await tvl(api)
  assert.equal(balances[USDC], 613000000n)
  assert.equal(balances[FRXUSD], 32n * 10n ** 18n)
  assert.equal(balances.usd, 132)
  assert.equal(Number(balances[USDC]) / 1e6 + Number(balances[FRXUSD]) / 1e18 + balances.usd, 777)
  assert.ok(!api.reads.some(r => /debt/i.test(r.abi)))
  assert.ok(api.reads.some(r => r.target === MGLOBAL_NAV && r.abi.includes('latestRoundData')))
})

test('subtracts kGear shares already included in a public vault NAV', async () => {
  assert.equal((await tvl(fixture({ nested: true })))[USDC], 606000000n)
})

test('a verified empty leveraged vault contributes zero', async () => {
  const balances = await tvl(fixture({ zero: true }))
  assert.equal(balances[USDC], 600000000n)
  assert.equal(balances[FRXUSD], 0n)
  assert.equal(balances.usd, 0)
})

test('historical reads before kGear deployment keep the three-vault total', async () => {
  const api = fixture({ block: 26240325 })
  assert.equal((await tvl(api))[USDC], 600000000n)
  assert.ok(!api.reads.some(r => r.target === KGEAR || r.abi.includes('creditAccounts')))
})

for (const fail of ['borrower', 'balance', 'price', 'timestamp']) {
  test(`fails the aggregate instead of substituting zero after a ${fail} failure`, async () => {
    await assert.rejects(tvl(fixture({ fail })))
  })
}

for (const fail of ['public-assets', 'public-total']) {
  test(`fails before nested-share deductions after a ${fail} failure`, async () => {
    const api = fixture({ fail, nested: true })
    await assert.rejects(tvl(api), /public vault read failed/)
    assert.ok(!api.reads.some(r => r.target === KGEAR), 'no leveraged accounting follows an incomplete public NAV')
  })

  test(`the existing curator entry point still permits a ${fail} failure`, async () => {
    const api = fixture({ fail, nested: true })
    await api.getBlock()
    const balances = await getCuratorTvl(api, { erc4626: PUBLIC })
    assert.equal(balances[USDC], 500000000n)
  })
}
