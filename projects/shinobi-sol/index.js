const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  await getSolBalanceFromStakePool('spp1mo6shdcrRyqDK2zdurJ8H5uttZE6H6oVjHxN1QN', api)
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  }
}