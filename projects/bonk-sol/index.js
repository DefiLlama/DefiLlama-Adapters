const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  await getSolBalanceFromStakePool('ArAQfbzsdotoKB5jJcZa3ajQrrPcWr2YQoDAEAiFxJAC', api)
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  }
}