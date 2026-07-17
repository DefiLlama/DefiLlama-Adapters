const assert = require('node:assert/strict')
const { describe, it } = require('node:test')
const { buildIncomingDebtByVault, scaleTokenAmount, subtractIncomingDebt } = require('./helpers')

const USDC = '0xusdc'
const DAI = '0xdai'
const DAI_VAULT = '0x028ec7330ff87667b6dfb0d94b954c820195336c'
const USDS_VAULT = '0x182863131f9a4630ff9e27830d945b1413e347e8'
const USDC_VAULT = '0xbe53a109b494e5c9f97b9cd39fe969be68bf6204'
const DAI_TO_USDS = '0xaedf7d5f3112552e110e5f9d08c9997adce0b78d'
const DAI_TO_USDC = '0xff03dce6d95aa7a30b75efbafd11384221b9f9b5'

// Minimal Kong-shaped vault fixture. Tests intentionally omit unrelated vault
// metadata so the overlap rules remain independent of presentation fields.
function vault(address, { asset = USDC, chainId = 1, debts = [] } = {}) {
  return { address, asset: { address: asset }, chainId, debts }
}

describe('buildIncomingDebtByVault', () => {
  it('deducts only the parent allocation from a nested vault', () => {
    const child = vault('0xchild')
    const parent = vault('0xparent', {
      debts: [{ strategy: child.address, currentDebt: '107000000000' }],
    })

    const incoming = buildIncomingDebtByVault([parent, child])
    const adjusted = subtractIncomingDebt('27578000000000', incoming.get(child.address))

    assert.equal(adjusted, 27471000000000n)
  })

  it('sums allocations from multiple parents', () => {
    const child = vault('0xchild')
    const parentA = vault('0xparent-a', { debts: [{ strategy: child.address, currentDebt: '4' }] })
    const parentB = vault('0xparent-b', { debts: [{ strategy: child.address, currentDebt: '6' }] })

    assert.equal(buildIncomingDebtByVault([parentA, parentB, child]).get(child.address), 10n)
  })

  it('deducts registered DAI debt routed into the USDS vault', () => {
    // Production-shaped 18-decimal DAI debt verifies the fixed 1:1 route.
    const parent = vault(DAI_VAULT, {
      asset: DAI,
      debts: [{ strategy: DAI_TO_USDS, currentDebt: '2538862803548935121717935' }],
    })
    const child = vault(USDS_VAULT, { asset: '0xusds' })

    assert.equal(
      buildIncomingDebtByVault([parent, child]).get(USDS_VAULT),
      2538862803548935121717935n,
    )
  })

  it('normalizes registered DAI debt to USDC decimals', () => {
    // The production-shaped debt loses twelve decimal places when expressed as
    // the 6-decimal USDC balance that will be returned by child.totalAssets().
    const parent = vault(DAI_VAULT, {
      asset: DAI,
      debts: [{ strategy: DAI_TO_USDC, currentDebt: '6951232209361095527647350' }],
    })
    const child = vault(USDC_VAULT)

    assert.equal(buildIncomingDebtByVault([parent, child]).get(USDC_VAULT), 6951232209361n)
  })

  it('requires the registered parent for a cross-asset strategy', () => {
    const unrelatedParent = vault('0xunrelated', {
      asset: DAI,
      debts: [{ strategy: DAI_TO_USDC, currentDebt: '1000000000000000000' }],
    })
    const child = vault(USDC_VAULT)

    assert.equal(buildIncomingDebtByVault([unrelatedParent, child]).has(USDC_VAULT), false)
  })

  it('ignores zero debt, different assets, other chains, and strategy-only addresses', () => {
    const child = vault('0xchild')
    const parent = vault('0xparent', {
      debts: [
        { strategy: child.address, currentDebt: '0' },
        { strategy: '0xstrategy-only', currentDebt: '10' },
      ],
    })
    const differentAsset = vault('0xdifferent-asset', {
      asset: DAI,
      debts: [{ strategy: child.address, currentDebt: '10' }],
    })
    const differentChain = vault('0xdifferent-chain', {
      chainId: 10,
      debts: [{ strategy: child.address, currentDebt: '10' }],
    })

    assert.equal(buildIncomingDebtByVault([parent, differentAsset, differentChain, child]).size, 0)
  })
})

describe('scaleTokenAmount', () => {
  it('scales amounts in both decimal directions', () => {
    assert.equal(scaleTokenAmount(1234567890123456789n, 18, 6), 1234567n)
    assert.equal(scaleTokenAmount(1234567n, 6, 18), 1234567000000000000n)
    assert.equal(scaleTokenAmount(123n, 18, 18), 123n)
  })
})

describe('subtractIncomingDebt', () => {
  it('floors the adjusted balance at zero', () => {
    assert.equal(subtractIncomingDebt('10', 10n), 0n)
    assert.equal(subtractIncomingDebt('10', 11n), 0n)
  })
})
