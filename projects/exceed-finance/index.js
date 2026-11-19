const { noteTvl } = require('./helper')

// exUSDC, Exceed's dollar note. exSOL and exBTC are listed separately
// (exceed-finance-exsol, exceed-finance-exbtc).
module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  solana: { tvl: noteTvl('exUSDC') },
}
