const index = require('./index')

module.exports = {
  bsc: {
    tvl: index.bsc.tvl,
    staking: index.bsc.staking,
  },
  /*
  moonriver: {
    tvl: () => 0,
    staking: index.moonriver.staking,
  },
  harmony: {
    tvl: () => 0,
    staking: index.harmony.staking,
  },
  */
}