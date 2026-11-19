const { noteTvl } = require('../exceed-finance/helper')

// exBTC, Exceed's bitcoin note (base: cbBTC).
module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  solana: { tvl: noteTvl('exBTC') },
}
