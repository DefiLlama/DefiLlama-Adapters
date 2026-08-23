const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const ROUTER = '0x6cf19308C22FC82ea620Fa0B3E94948d20f27B96'

// Assets in the markets listed by the official Deepstate interface.
const TOKENS = [
  ADDRESSES.robinhood.USDG,
  '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC', // NVDA
  '0x1DA24f6Bb623b9d1aFEae3F3146659A2662D6d27', // DEEP
]

module.exports = {
  methodology:
    'TVL is the value of USDG, NVDA, and DEEP held by the Deepstate router as collateral for resting orders or as matched proceeds awaiting maker claims.',
  start: '2026-08-14',
  robinhood: {
    tvl: sumTokensExport({ owner: ROUTER, tokens: TOKENS }),
  },
}
