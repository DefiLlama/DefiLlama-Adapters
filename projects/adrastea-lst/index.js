const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  await getSolBalanceFromStakePool('2XhsHdwf4ZDpp2JhpTqPovoVy3L2Atfp1XkLqFMwGP4Y', api)
}

module.exports = {
  timetravel: false,
  solana: { tvl },
  methodology: "TVL represents the total amount of SOL staked in Adrastea's liquid staking pool"
};
