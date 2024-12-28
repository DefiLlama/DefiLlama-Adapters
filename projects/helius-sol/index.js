const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  await getSolBalanceFromStakePool('3wK2g8ZdzAH8FJ7PKr2RcvGh7V9VYson5hrVsJM5Lmws', api)
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  }
}