const { tvl } = require('./tvl');

module.exports = {
  methodology: 'Counts the pool size as the TVL.',
  timetravel: false,
  misrepresentedTokens: true,
  ton: {
    tvl,
  }
}
