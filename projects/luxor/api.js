const index = require('./index')

module.exports = {
  fantom: {
    tvl: () => 0,
    staking: index.fantom.staking,
  },
  deadFrom: '2023-05-01'
}