const test = require('node:test')
const assert = require('node:assert/strict')

const { allocateSharedCash } = require('../projects/flying-tulip-ftusd/shared')
const lend = require('../projects/flying-tulip-lend')
const ftusd = require('../projects/flying-tulip-ftusd')

const BSC_USDC = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
const BSC_USDT = '0x55d398326f99059fF775485246999027B3197955'

/**
 * Load a fresh Lend adapter with a mocked receipt-token balance helper.
 * @param {Function} sumTokens2 Mock used while the adapter module loads.
 * @returns {object} Adapter instance isolated from the module cache.
 */
function loadLendWithMockSumTokens(sumTokens2) {
  const helperPath = require.resolve('../projects/helper/unwrapLPs')
  const adapterPath = require.resolve('../projects/flying-tulip-lend')
  const helper = require(helperPath)
  const original = helper.sumTokens2
  helper.sumTokens2 = sumTokens2
  delete require.cache[adapterPath]
  const adapter = require(adapterPath)
  helper.sumTokens2 = original
  delete require.cache[adapterPath]
  return adapter
}

test('ftUSD receives the shared cash first, without making Lend negative', () => {
  assert.deepEqual(allocateSharedCash(60n, 80n), { ftusd: 60n, lend: 0n })
  assert.deepEqual(allocateSharedCash(100n, 40n), { ftusd: 40n, lend: 60n })
  assert.deepEqual(allocateSharedCash(0n, 40n), { ftusd: 0n, lend: 0n })
})

test('shared cash allocation rejects invalid reserve or claim balances', () => {
  assert.throws(() => allocateSharedCash(-1n, 2n), /negative/i)
  assert.throws(() => allocateSharedCash(1n, -2n), /negative/i)
})

test('BSC Lend keeps only residual USDC and USDT cash and reports gross borrows separately', async () => {
  const isolatedLend = loadLendWithMockSumTokens(async () => {})
  const balances = {}
  const cash = { [BSC_USDC.toLowerCase()]: 60n, [BSC_USDT.toLowerCase()]: 100n }
  const debt = { [BSC_USDC.toLowerCase()]: 70n, [BSC_USDT.toLowerCase()]: 50n }
  const claim = { [BSC_USDC.toLowerCase()]: 80n, [BSC_USDT.toLowerCase()]: 40n }
  const api = {
    chain: 'bsc',
    getBalances: () => balances,
    add(token, amount) {
      const key = token.toLowerCase()
      balances[key] = (balances[key] || 0n) + BigInt(amount)
    },
    async fetchList() { return [] },
    async multiCall({ abi, calls }) {
      if (!abi.includes('assetState')) return []
      return calls.map(token => ({
        cash: cash[token.toLowerCase()] || 0n,
        borrows: debt[token.toLowerCase()] || 0n,
      }))
    },
    async call({ abi, params }) {
      const token = params[params.length - 1].toLowerCase()
      if (abi.includes('getBalance')) return [claim[token] || 0n, 0n]
      if (abi.includes('assetState')) return { cash: cash[token] || 0n, borrows: debt[token] || 0n }
      throw new Error(`Unexpected ABI: ${abi}`)
    },
  }

  assert.equal(typeof isolatedLend.bsc?.tvl, 'function')
  await isolatedLend.bsc.tvl(api)
  assert.equal(balances[BSC_USDC.toLowerCase()] || 0n, 0n)
  assert.equal(balances[BSC_USDT.toLowerCase()], 60n)

  for (const token of Object.keys(balances)) delete balances[token]
  await isolatedLend.bsc.borrowed(api)
  assert.equal(balances[BSC_USDC.toLowerCase()], 70n)
  assert.equal(balances[BSC_USDT.toLowerCase()], 50n)
})

test('Ethereum and Sonic Lend use the same shared-cash allocation', async () => {
  const isolatedLend = loadLendWithMockSumTokens(async () => {})

  for (const fixture of [
    { chain: 'sonic', cash: [60n], claim: [80n], expected: [0n] },
    { chain: 'ethereum', cash: [100n, 50n], claim: [40n, 80n], expected: [60n, 0n] },
  ]) {
    const tokens = fixture.chain === 'sonic'
      ? ['0x29219dd400f2Bf60E5a23d13Be72B486D4038894']
      : ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0xdAC17F958D2ee523a2206206994597C13D831ec7']
    const balances = {}
    const api = {
      chain: fixture.chain,
      getBalances: () => balances,
      add(token, amount) {
        const key = token.toLowerCase()
        balances[key] = (balances[key] || 0n) + BigInt(amount)
      },
      async fetchList() { return [] },
      async multiCall() { return [] },
      async call({ abi, params }) {
        const index = tokens.findIndex(token => token.toLowerCase() === params[params.length - 1]?.toLowerCase())
        if (abi.includes('getBalance')) return [fixture.claim[index], 0n]
        if (abi.includes('assetState')) return { cash: fixture.cash[index], borrows: 0n }
        throw new Error(`Unexpected ABI: ${abi}`)
      },
    }
    await isolatedLend[fixture.chain].tvl(api)
    tokens.forEach((token, i) => assert.equal(balances[token.toLowerCase()] || 0n, fixture.expected[i]))
  }
})

test('BSC Lend values an independent reserve from held receipt tokens', async () => {
  const wbnb = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
  const isolatedLend = loadLendWithMockSumTokens(async ({ api, tokensAndOwners }) => {
    if (tokensAndOwners.some(([token]) => token.toLowerCase() === wbnb.toLowerCase())) api.add(wbnb, 125n)
  })
  const balances = {}
  const api = {
    chain: 'bsc',
    getBalances: () => balances,
    add(token, amount) {
      const key = token.toLowerCase()
      balances[key] = (balances[key] || 0n) + BigInt(amount)
    },
    async fetchList() { return [] },
    async multiCall({ abi, calls }) {
      if (abi.includes('assetState')) return calls.map(token => ({ cash: token.toLowerCase() === wbnb.toLowerCase() ? 100n : 0n, borrows: 0n }))
      return []
    },
    async call({ abi }) {
      if (abi.includes('getBalance')) return [0n, 0n]
      if (abi.includes('assetState')) return { cash: 0n, borrows: 0n }
      throw new Error(`Unexpected ABI: ${abi}`)
    },
  }
  await isolatedLend.bsc.tvl(api)
  assert.equal(balances[wbnb.toLowerCase()], 125n)
})

test('BSC Lend does not read wrappers before their deployment blocks', async () => {
  const historicalBlock = 123848543 // 2026-09-25, before ETH/BTCB/wBETH/QQQB wrapper deployments
  const listedWrappers = []
  const isolatedLend = loadLendWithMockSumTokens(async ({ tokensAndOwners }) => {
    assert.equal(tokensAndOwners.length, 3) // WBNB, FDUSD, asBNB
  })
  const api = {
    chain: 'bsc', block: historicalBlock,
    getBalances: () => ({}),
    add() {},
    async fetchList({ target }) { listedWrappers.push(target.toLowerCase()); return [] },
    async multiCall({ abi, calls }) {
      if (abi.includes('assetState')) {
        assert.equal(calls.length, 5) // only the five markets already deployed
        return calls.map(() => ({ borrows: 0n }))
      }
      return []
    },
    async call({ abi }) {
      if (abi.includes('getBalance')) return [0n, 0n]
      if (abi.includes('assetState')) return { cash: 0n }
      throw new Error(`Unexpected ABI: ${abi}`)
    },
  }
  await isolatedLend.bsc.tvl(api)
  assert.equal(listedWrappers.length, 3)
  await isolatedLend.bsc.borrowed(api)
})

test('BSC Lend is empty before its first wrapper deployment', async () => {
  const isolatedLend = loadLendWithMockSumTokens(async () => { throw new Error('Unexpected token read') })
  const api = {
    chain: 'bsc', block: 115757611,
    getBalances: () => ({}),
    async fetchList() { throw new Error('Unexpected wrapper read') },
    async multiCall() { throw new Error('Unexpected reserve read') },
    async call() { throw new Error('Unexpected shared-cash read') },
  }
  assert.deepEqual(await isolatedLend.bsc.tvl(api), {})
  assert.deepEqual(await isolatedLend.bsc.borrowed(api), {})
})

test('BSC ftUSD counts wrapper and strategy idle assets plus its capped Lend cash', async () => {
  const tokens = [BSC_USDC, BSC_USDT]
  const wrappers = ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002']
  const strategy = '0x7eF4ED045E693E10E6ed08ac71438b661f09817A'
  const balances = {}
  const cash = [60n, 100n]
  const claim = [80n, 40n]
  const api = {
    chain: 'bsc',
    getBalances: () => balances,
    add(token, amount) {
      const key = token.toLowerCase()
      balances[key] = (balances[key] || 0n) + BigInt(amount)
    },
    async fetchList({ target }) {
      if (target.toLowerCase() === '0x7d73863178a3ecb9767f0be1bf50f55305a52743') return tokens
      if (wrappers.some(wrapper => wrapper.toLowerCase() === target.toLowerCase())) return [strategy]
      throw new Error(`Unexpected list target: ${target}`)
    },
    async multiCall({ abi }) {
      if (abi.includes('collateralInfo')) return wrappers.map(yieldWrapper => ({ yieldWrapper }))
      if (abi.includes('positionToken') || abi.includes(':token')) return [BSC_USDC, BSC_USDC]
      throw new Error(`Unexpected multicall ABI: ${abi}`)
    },
    async call({ abi, target, params }) {
      const token = params?.[params.length - 1]
      const index = tokens.findIndex(item => item.toLowerCase() === token?.toLowerCase())
      if (abi.includes('getBalance')) return [claim[index], 0n]
      if (abi.includes('assetState')) return { cash: cash[index], borrows: 0n }
      if (abi.includes('balanceOf')) {
        const assetIndex = tokens.findIndex(item => item.toLowerCase() === target.toLowerCase())
        if (params[0].toLowerCase() === wrappers[assetIndex]?.toLowerCase()) return assetIndex === 0 ? 5n : 0n
        if (params[0].toLowerCase() === strategy.toLowerCase()) return assetIndex === 0 ? 3n : 0n
        return 0n
      }
      throw new Error(`Unexpected call ABI: ${abi}`)
    },
  }
  assert.equal(typeof ftusd.bsc?.tvl, 'function')
  await ftusd.bsc.tvl(api)
  assert.equal(balances[BSC_USDC.toLowerCase()], 68n)
  assert.equal(balances[BSC_USDT.toLowerCase()], 40n)
})

test('BSC ftUSD returns empty before the MintAndRedeem deployment block', async () => {
  const api = {
    chain: 'bsc', block: 108860157,
    getBalances: () => ({}),
    async fetchList() { throw new Error('Unexpected pre-deployment call') },
  }
  assert.deepEqual(await ftusd.bsc.tvl(api), {})
})

test('ftUSD rejects a funded external strategy whose position metadata is unreadable', async () => {
  const token = '0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409'
  const wrapper = '0xF92ec094BEed3d7fEEaa4E2886483Ba7AA3a5E7d'
  const strategy = '0xb82cF297e385B4F8349947E67f09b4267B175B43'
  const api = {
    chain: 'bsc',
    getBalances: () => ({}),
    add() {},
    async fetchList({ target }) { return target.toLowerCase() === wrapper.toLowerCase() ? [strategy] : [token] },
    async multiCall({ abi }) {
      if (abi.includes('collateralInfo')) return [{ yieldWrapper: wrapper }]
      return [null]
    },
    async call({ target, params }) {
      if (target.toLowerCase() === strategy.toLowerCase() && params[0].toLowerCase() === wrapper.toLowerCase()) return 1n
      return 0n
    },
  }
  await assert.rejects(() => ftusd.bsc.tvl(api), /funded.*metadata/i)
})
