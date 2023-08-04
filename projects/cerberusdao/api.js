const index = require('./index')

module.exports = {
  ethereum: {
    tvl: () => 0,
    staking: index.ethereum.staking,
  }
}