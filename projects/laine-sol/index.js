const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  await getSolBalanceFromStakePool('2qyEeSAWKfU18AFthrF7JA8z8ZCi1yt76Tqs917vwQTV', api)
}

module.exports ={
  timetravel: false,
  solana: { tvl },
};