const { sumTokens2, } = require('../helper/solana')

// https://www.npmjs.com/package/@unstake-it/sol
// https://learn.sanctum.so/docs/contracts

async function tvl() {
  return sumTokens2({ solOwners: ['3rBnnH9TTgd3xwu48rnzGsaQkSr1hR64nY71DrDt6VrQ'],})
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}
