const { getStakedSol } = require('../helper/solana')

const SolStakingAccount = 'STNi1NHDUi6Hvibvonawgze8fM83PFLeJhuGMEXyGps'

async function tvl(api) {
  await getStakedSol(SolStakingAccount, api)
}

module.exports = {
  methodology: `We sum the amount of SOL staked by account ${SolStakingAccount}`,
  timetravel: false,
  solana: { tvl }
}
