const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  // dSOL sanctum stake pool : https://solscan.io/account/9mhGNSPArRMHpLDMSmxAvuoizBqtBGqYdT8WGuqgxNdn
  await getSolBalanceFromStakePool('9mhGNSPArRMHpLDMSmxAvuoizBqtBGqYdT8WGuqgxNdn', api)
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  }
}