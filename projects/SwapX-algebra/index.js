const { getTVL } = require('../SwapX-v2/utils');

module.exports = {
  sonic: {
    tvl: (api) => getTVL(api, false)
  }
};