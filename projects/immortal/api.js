const index = require('./index')

module.exports = {
  celo: {
    tvl: () => 0,
    staking: index.celo.staking,
  }
}