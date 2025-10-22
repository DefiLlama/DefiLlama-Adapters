const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  await getSolBalanceFromStakePool('Fu9BYC6tWBo1KMKaP3CFoKfRhqv9akmy3DuYwnCyWiyC', api)
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  }
}