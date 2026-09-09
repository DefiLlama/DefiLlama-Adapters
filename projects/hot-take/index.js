const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// Hot Take ParimutuelV6 proxy on Base mainnet. All value is native USDC:
// user protocol balances plus stakes escrowed in active bets.
const HOT_TAKE = '0x64Be8f389E202a77b446C7E86B564F4122Cb5a66'

module.exports = {
  // Contract deployed 2026-06-29T04:54:09Z (Base block 47959751) — before
  // that there is no contract to read a balance from.
  start: '2026-06-29',
  methodology:
    'TVL is the USDC held by the Hot Take betting contract on Base: user protocol balances plus stakes locked in active bets.',
  base: {
    tvl: sumTokensExport({ owner: HOT_TAKE, tokens: [ADDRESSES.base.USDC] }),
  },
}
