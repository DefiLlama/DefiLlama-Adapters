const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  await getSolBalanceFromStakePool('6LXCxeyQZqdAL4yLCtgATFYF6dcayWvsiwjtBFYVfb1N', api)
}

module.exports ={
  timetravel: false,
  solana: { tvl },
};