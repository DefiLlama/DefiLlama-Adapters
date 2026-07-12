const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const PRIZE_POOL = '0x2Ac493f86D1925c3f9C34Ce1875Bb16e3CfF960c'

module.exports = {
  methodology:
    'TVL is the ETH prize pool held by the HOODZ game contract on Robinhood Chain, awaiting automatic distribution to round winners. Players enter rounds with $HOODZ tokens; winners are paid in ETH directly from this contract.',
  robinhood: {
    tvl: sumTokensExport({ owner: PRIZE_POOL, tokens: [nullAddress] }),
  },
}
