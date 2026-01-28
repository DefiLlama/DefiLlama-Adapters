const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
  await getSolBalanceFromStakePool('LW3qEdGWdVrxNgxSXW8vZri7Jifg4HuKEQ1UABLxs3C', api)
}

module.exports ={
  timetravel: false,
  solana: { tvl },
};