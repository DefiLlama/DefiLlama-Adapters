
const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  await getSolBalanceFromStakePool('2aMLkB5p5gVvCwKkdSo5eZAL1WwhZbxezQr1wxiynRhq', api)
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  }
}