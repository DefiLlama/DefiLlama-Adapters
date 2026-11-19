const index = require('./index')

module.exports = {
  ethereum: {
    tvl: () => 0,
    // borrowed removed — Cooler Loans debt is now tracked separately via projects/cooler-loans
    staking: index.ethereum.staking,
  }
}
