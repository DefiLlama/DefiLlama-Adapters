const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  await getSolBalanceFromStakePool('pSPcvR8GmG9aKDUbn9nbKYjkxt9hxMS7kF1qqKJaPqJ', api)
}

module.exports ={
  timetravel: false,
  solana: { tvl },
};