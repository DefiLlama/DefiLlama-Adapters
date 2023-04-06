const bsc = require('./bsc')
const arbitrum = require('./arbitrum')

module.exports = {
  misrepresentedTokens: true,
  bsc: { tvl: bsc },
  // arbitrum: { tvl: arbitrum },
};
