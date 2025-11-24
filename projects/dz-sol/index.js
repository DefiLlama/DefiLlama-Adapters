const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  await getSolBalanceFromStakePool('3fV1sdGeXaNEZj6EPDTpub82pYxcRXwt2oie6jkSzeWi', api)
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  }
}