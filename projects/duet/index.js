const bsc = require('./bsc')
const arbitrum = require('./arbitrum')

module.exports = {
  bsc: { tvl: bsc },
  arbitrum: { tvl: arbitrum },
};
