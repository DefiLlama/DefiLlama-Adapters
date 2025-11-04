const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  await getSolBalanceFromStakePool('hy1oDeVCVRDGkxS26qLVDvRhDpZGfWJ6w9AMvwMegwL', api)
  await getSolBalanceFromStakePool('hy1o2kiYu9rUDFqHJSqwJH4j5ZkM23tBJsaEmqkP9sT', api)
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  }
}