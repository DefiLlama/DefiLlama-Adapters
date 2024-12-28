const index = require('./index')

module.exports = {
  smartbch: {
    tvl: () => 0,
    staking: index.smartbch.staking,
  }
}