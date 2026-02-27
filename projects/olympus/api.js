const index = require('./index')

module.exports = {
  ethereum: {
    tvl: () => 0,
    borrowed: index.ethereum.borrowed,
    staking: index.ethereum.staking,
  }
}