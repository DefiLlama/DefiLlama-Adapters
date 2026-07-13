const index = require('./index')

module.exports = {
  arbitrum: {
    tvl: () => 0,
    staking: index.arbitrum.staking,
  },
  deadFrom: '2023-01-30'
}
