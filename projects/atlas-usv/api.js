const index = require('./index')

module.exports = {
  polygon: {
    tvl: () => 0,
    staking: index.polygon.staking,
  }
}