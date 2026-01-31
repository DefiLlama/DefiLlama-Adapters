const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  await getSolBalanceFromStakePool('4cLLFNT2WAoioAYXfEF8rqgg1gSW4kNN3y8qyTz1kPmh', api)
}

module.exports ={
  timetravel: false,
  solana: { tvl },
};