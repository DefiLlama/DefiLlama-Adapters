const assert = require('node:assert/strict')
const { test, beforeEach, after } = require('node:test')
const { createRequire } = require('node:module')
const requireFromRepo = createRequire(`${__dirname}/../../package.json`)
const axios = requireFromRepo('axios')
const cache = requireFromRepo('./projects/helper/cache')
const { address: tonAddress } = requireFromRepo('./projects/helper/utils/ton')

const ethereumWallet = '0x31cc188c4c8db0bb5d30ff7c74e04c4d64d81e1b'
const suiWallets = [
  '0x74385b8eeb0cdf1d4849e340b00f79058b4aa9228322839b327f37a5c784a293',
  '0x7814f6a9f08290a6c000830549c95061fea8d56a9014daeadd5388b3da798930',
  '0x438342fcc00c286a57e0fd3df760e9e0b45f4c2d296de7372b939bc1e145b521',
]
const tonWallet = 'UQDGbHH9Gxgldhg_ZuWDIRACd0S5BX8Y_8IjgnlWRACuPE4U'
const existingEthereum = `0x${'11'.repeat(20)}`
const existingSui = `0x${'22'.repeat(32)}`
const existingTon = tonAddress(`0:${'33'.repeat(32)}`).toString()
const normalizedTon = tonAddress(tonWallet).toString()
let csv = 'Coin,Height,Amount,Address\n'
let cachedOwners
beforeEach(() => {
  csv = 'Coin,Height,Amount,Address\n'
  cachedOwners = undefined
})
const originalAxiosGet = axios.get
const originalGetConfig = cache.getConfig
axios.get = async () => ({ data: csv })
cache.getConfig = async (key, endpoint, { fetcher }) => cachedOwners ?? fetcher()
after(() => {
  axios.get = originalAxiosGet
  cache.getConfig = originalGetConfig
})
const adapter = requireFromRepo('./cex/bybit')

test('adds exactly five supplemental wallets when PoR has no owners', async () => {
  assert.deepEqual(await adapter.ethereum.owners(), [ethereumWallet])
  assert.deepEqual(await adapter.sui.owners(), suiWallets)
  assert.deepEqual(await adapter.ton.owners(), [normalizedTon])
})

test('preserves existing PoR wallets on all three affected chains', async () => {
  csv = `Coin,Height,Amount,Address\nETH-Ethereum,1,1,${existingEthereum}\nSUI-SUI,1,1,${existingSui}\nTON-TON,1,1,${existingTon}\n`
  assert.deepEqual(await adapter.ethereum.owners(), [existingEthereum, ethereumWallet])
  assert.deepEqual(await adapter.sui.owners(), [existingSui, ...suiWallets])
  assert.deepEqual(await adapter.ton.owners(), [existingTon, normalizedTon])
})

test('deduplicates case variants and TON bounceable/non-bounceable aliases', async () => {
  const uppercaseEthereum = `0x${ethereumWallet.slice(2).toUpperCase()}`
  const bounceableTon = tonAddress(tonWallet).toString({ bounceable: true })
  csv = `Coin,Height,Amount,Address\nETH-Ethereum,1,1,${uppercaseEthereum} ${ethereumWallet}\nSUI-SUI,1,1,${suiWallets.join(' ')}\nTON-TON,1,1,${tonWallet} ${bounceableTon}\n`
  assert.deepEqual(await adapter.ethereum.owners(), [ethereumWallet])
  assert.deepEqual(await adapter.sui.owners(), suiWallets)
  assert.deepEqual(await adapter.ton.owners(), [normalizedTon])
})

test('normalizes cached owners before merging supplemental owners', async () => {
  cachedOwners = {
    ethereum: [`0x${ethereumWallet.slice(2).toUpperCase()}`, existingEthereum],
    sui: [existingSui, ...suiWallets],
    ton: [tonWallet, tonAddress(tonWallet).toRawString(), existingTon],
  }
  assert.deepEqual(await adapter.ethereum.owners(), [ethereumWallet, existingEthereum])
  assert.deepEqual(await adapter.sui.owners(), [existingSui, ...suiWallets])
  assert.deepEqual(await adapter.ton.owners(), [normalizedTon, existingTon])
})

test('preserves unrelated dynamic owners, static overrides and extra tokens', async () => {
  const solanaWallet = 'FvLsZiM3g2ZnehkK42c4EoLASBdchKnqzxyAEmGhViZq'
  csv = `Coin,Height,Amount,Address\nSOL-Solana,1,1,${solanaWallet}\n`
  assert.deepEqual(await adapter.solana.owners(), [solanaWallet])
  assert.deepEqual(await adapter.arbitrum.owners(), [])
  assert.equal(adapter.bitcoin, 'bybit')
  assert.deepEqual(adapter.cardano.owners, ['addr1v8mn6dmk7tf9u26kr09a05lmvc9j4k9d940a88ta3hdczqgyt7whl'])
  assert.deepEqual(adapter.fantom.owners, ['0xf89d7b9c864f589bbF53a82105107622B35EaA40'])
  assert.deepEqual(adapter.starknet.owners, ['0x076601136372fcdbbd914eea797082f7504f828e122288ad45748b0c8b0c9696'])
  assert.equal(adapter.berachain.tokens.length, 2)
})

test('CEX registry exposes the patched config and valid TVL functions', async () => {
  const registry = requireFromRepo('./cex')
  assert.equal(registry._rawConfigs.bybit, adapter)
  for (const chain of ['ethereum', 'sui', 'ton'])
    assert.equal(typeof registry.bybit[chain].tvl, 'function')
})
