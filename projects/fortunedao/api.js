const index = require('../fortunedao.js')

module.exports = {
  cronos: {
    tvl: () => 0,
    staking: index.cronos.staking,
  }
}