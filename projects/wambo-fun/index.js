const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// wambo.fun — parimutuel memecoin races on Robinhood Chain. RaceBook holds
// every wei the venue owes anyone: live race stakes, unclaimed winnings and
// refunds, accrued rake and the rollover pot, all in native ETH.
const RACEBOOK = '0x6a8196b02d94e96366ace6f494fc46eae3c35e31'

module.exports = {
  methodology:
    'TVL is the native ETH held by the RaceBook contract: live race stakes, unclaimed winnings and refunds, accrued rake and the pot rolling into the next race.',
  start: '2026-08-11',
  robinhood: {
    tvl: sumTokensExport({ owner: RACEBOOK, tokens: [ADDRESSES.null] }),
  },
}
