const bsc = require('./bsc')
const arbitrum = require('./arbitrum')

module.exports = {
  bsc,
  arbitrum: { tvl: arbitrum },
};
