const { v2Tvl } = require('./v2.js');

module.exports = {
  xlayer: {
    tvl: v2Tvl,
  },
  misrepresentedTokens: true,
};
