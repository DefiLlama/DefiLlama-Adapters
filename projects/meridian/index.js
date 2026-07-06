const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const PREDICTION_MARKET_ESCROW = '0xE4cea507b19796362A5a28Fa7cb705A3F1866213'

module.exports = {
  methodology: 'TVL is the USDe collateral held in the PredictionMarketEscrow contract.',
  robinhood: {
    tvl: sumTokensExport({ owner: PREDICTION_MARKET_ESCROW, tokens: [ADDRESSES.robinhood.USDe] }),
  },
}
