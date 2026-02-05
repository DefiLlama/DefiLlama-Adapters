const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  await getSolBalanceFromStakePool('jagEdDepWUgexiu4jxojcRWcVKKwFqgZBBuAoGu2BxM', api)
}

module.exports ={
  timetravel: false,
  solana: { tvl },
};