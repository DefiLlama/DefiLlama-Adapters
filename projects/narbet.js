const { sumTokensExport, nullAddress } = require('./helper/unwrapLPs')

const ADDRESS_BANKROLL = "0x71dc4a726C92E6bf506F2Afc2Cee8B63A89B29EC"

module.exports = {
  monad: {
    tvl: sumTokensExport({
      owner: ADDRESS_BANKROLL,
      tokens: [nullAddress]
    })
  }
}

