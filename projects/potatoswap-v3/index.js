const { v3Tvl } = require('../potatoswap/v3.js');

module.exports = {
  xlayer: {
    tvl: v3Tvl,
  },
  misrepresentedTokens: true,
};
