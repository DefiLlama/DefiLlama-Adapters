const index = require('./index')

module.exports = {
  avax: {
    tvl: () => 0,
    staking: index.avax.staking,
  }
}

