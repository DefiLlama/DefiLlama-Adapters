const { getTVL } = require('./utils');

module.exports = {
  sonic: {
    tvl: (api) => getTVL(api, false)
  }
};