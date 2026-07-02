const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const HOODBETS = '0xA3cD4D80B48B272f14E233D266b1103900cb42fC'

module.exports = {
  methodology:
    'TVL is the native ETH held by the HoodBets contract: open parimutuel betting pools plus settled winnings awaiting claim. Markets are settled permissionlessly against Chainlink stock price feeds.',
  start: '2026-07-02',
  robinhood: {
    tvl: sumTokensExport({ owner: HOODBETS, tokens: [nullAddress] }),
  },
}
