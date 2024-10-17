const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  await getSolBalanceFromStakePool('8VpRhuxa7sUUepdY3kQiTmX9rS5vx4WgaXiAnXq4KCtr', api)
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  }
}