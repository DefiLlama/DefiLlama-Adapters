
const { getSolBalanceFromStakePool } = require('./helper/solana')

async function tvl(api) {
  // https://jpool.one/pool-info
  await getSolBalanceFromStakePool('CtMyWsrUtAwXWiGr9WjHT5fC3p3fgV8cyGpLTo2LJzG1', api)
}

module.exports = {
  timetravel: false,
  methodology: "JSOL total supply as it's equal to the SOL staked",
  solana: {
    tvl
  }
}