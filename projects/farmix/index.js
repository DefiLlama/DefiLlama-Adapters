const { tvl } = require('./tvl');
const { borrowed } = require('./borrowed');

module.exports = {
  methodology: 'TVL is counted only as current available pool liquidity. Borrowed jettons not included in the tvl',
  timetravel: false,
  misrepresentedTokens: true,
  ton: {
    tvl,
    borrowed,
  }
}