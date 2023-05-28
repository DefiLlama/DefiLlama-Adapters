const { tvl } = require('./tvl');
const { borrowed } = require('./borrowed');

module.exports = {
  methodology: 'Counts the tokens and the floor value of NFTs locked in the contracts to be used as collateral to borrow. Borrowed coins are not counted towards the TVL',
  timetravel: false,
  misrepresentedTokens: true,
  ton: {
    tvl,
    borrowed,
  }
}
