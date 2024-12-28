const { exportDexTVL } = require('../helper/solana')

module.exports = {
  timetravel: false,
  solana: {
    tvl: exportDexTVL('SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8')
  }
}