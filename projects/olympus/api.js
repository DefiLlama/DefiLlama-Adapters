const index = require('./index')

module.exports = {
  ...index,
  ethereum: {
    tvl: index.ethereum.tvl,
    staking: index.ethereum.staking,
  }
}
