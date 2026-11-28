const ADDRESSES = require('../helper/coreAssets.json')

// Perma (https://perma.trade): BTC leverage on HyperEVM with no liquidation price (everlasting options).
// One pool takes the other side of every position and hedges on Hyperliquid perps. Its USDC sits partly on
// HyperEVM and partly on the pool's own HyperCore account; coreAssets() is that Core account's value in USDC (6 dp).
const POOL = '0x6f43b8C0a44B7154923ea4Dae9f1187676348c51'

async function tvl(api) {
  await api.sumTokens({ owner: POOL, tokens: [ADDRESSES.hyperliquid.USDC] })
  const core = await api.call({ target: POOL, abi: 'function coreAssets() view returns (int256)' })
  if (+core > 0) api.add(ADDRESSES.hyperliquid.USDC, core)
}

module.exports = {
  methodology: 'USDC held by the Perma pool on HyperEVM plus the value of the pool\'s HyperCore account, which holds the margin for its Hyperliquid hedge.',
  start: '2026-11-26',
  hyperliquid: { tvl },
}
