const { noteTvl } = require('../exceed-finance/helper')

// exSOL, Exceed's SOL note.
module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  solana: { tvl: noteTvl('exSOL') },
}
