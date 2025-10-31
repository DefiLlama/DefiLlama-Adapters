const { v2Tvl } = require('../potatoswap/v2.js');

module.exports = {
  xlayer: {
    tvl: v2Tvl,
  },
  misrepresentedTokens: true,
};
