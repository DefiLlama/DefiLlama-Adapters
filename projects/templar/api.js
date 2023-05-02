const index = require('./index')

module.exports = {
  bsc: {
    tvl: () => 0,
    staking: index.bsc.staking,
  },
  moonriver: {
    tvl: () => 0,
    staking: index.moonriver.staking,
  },
  harmony: {
    tvl: () => 0,
    staking: index.harmony.staking,
  },
}