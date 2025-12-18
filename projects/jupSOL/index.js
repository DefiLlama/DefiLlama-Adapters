const { getStakedSol, getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  // jupSOL
  await getSolBalanceFromStakePool('8VpRhuxa7sUUepdY3kQiTmX9rS5vx4WgaXiAnXq4KCtr', api)

  // Jupiter Labs Perpetuals Vault
  await getStakedSol('AVzP2GeRmqGphJsMxWoqjpUifPpCret7LqWhD8NWQK49', api)
}

module.exports = {
  timetravel: false,
  methodology: 'Total SOL staked in jupSOL and SOL staked from Jupiter Perpetual Exchange',
  solana: {
    tvl
  }
}