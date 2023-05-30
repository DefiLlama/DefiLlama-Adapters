const { tvl } = require('./tvl');
const { borrowed } = require('./borrowed');

module.exports = {
  methodology: 'Counts minimum values of all pledged NFTs as borrowed TON coins (50% of actual prices) plus the pool size. Actual prices of total NFTs may be higher. Doesn\'t count NFTs that were not bought back.',
  timetravel: false,
  misrepresentedTokens: true,
  ton: {
    tvl,
    borrowed,
  }
}
