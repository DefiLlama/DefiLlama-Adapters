const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// HedgeHood Options: cash-settled European options on Robinhood Chain stock tokens, traded by AI agents and on
// hedgehood.io/options. One CashOptionMarketV2 per underlying holds every account's USDG: deposits, the margin
// behind short positions and premiums received. The order books hold nothing. Source verified on Sourcify, e.g.
// https://sourcify.dev/server/v2/contract/4663/0x99AfB93D21B4369207f090f80Fad6551b5316163
const MARKETS = [
  '0x99AfB93D21B4369207f090f80Fad6551b5316163', // NVDA
  '0x205E146a5Bfc4213399a6e01D347ac1F443bb1Ab', // TSLA
  '0x6bc821D2E305C0486f1a2c40A4CaBA67F32E9Fce', // MU
  '0xF00Db795444EE30ad3dBE836BCd82A5f18D39Afd', // GOOGL
  '0x348dc1b94099CfbFf5A142f78a41542a42f4b2C7', // CRCL
  '0x39B338A02B33766C56C91049A5965ba7694754DF', // MSTR
  '0x4698Dd37664ade58c173FFd10C3A4DCE6d33241D', // AMD
]

module.exports = {
  methodology:
    'TVL is the USDG held by the seven option markets (one per underlying stock): account deposits, the margin that backs short option positions and premiums not yet withdrawn. Options are cash-settled in USDG, so the markets hold no stock.',
  start: '2026-10-29',
  robinhood: {
    tvl: sumTokensExport({ owners: MARKETS, tokens: [ADDRESSES.robinhood.USDG] }),
  },
}
