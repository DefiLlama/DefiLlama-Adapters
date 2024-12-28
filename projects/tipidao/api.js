const index = require('./index')

module.exports = {
  bsc: {
    tvl: () => 0,
    staking: index.bsc.staking,
  }
}

