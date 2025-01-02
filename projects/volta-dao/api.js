const index = require('./index')

module.exports = {
  fantom: {
    tvl: () => 0,
    staking: index.fantom.staking,
  },
  avax: {
    tvl: () => 0,
    staking: index.avax.staking,
  },
}