const { tvl } = require('./tvl');
const { borrowed } = require('./borrowed');

module.exports = {
  methodology: 'Counts the pool size as the TVL. Borrowed coins are not counted towards the TVL.',
  timetravel: false,
  misrepresentedTokens: true,
  ton: {
    tvl,
    borrowed,
  }
}
