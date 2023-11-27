const index = require('./index')

module.exports = {
  arbitrum: {
    tvl: () => 0,
    staking: index.arbitrum.staking,
  },
  deadFrom: '20213-01-30'
}