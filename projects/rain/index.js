const { Program } = require("@project-serum/anchor");
const { getProvider } = require("../helper/solana");
const sdk = require('@defillama/sdk');

const idl = require('./idl')

async function tvl() {
  const provider = getProvider()
  const program = new Program(idl, 'RainEraPU5yDoJmTrHdYynK9739GkEfDsE4ffqce2BR', provider)
  const pools = await program.account.pool.all()
  const balances = {}

  for (const pool of pools) {

    sdk.util.sumSingleBalance(balances, 'solana:' + pool.account.currency, pool.account.totalAmount.toString())
  }

  return balances;
}

module.exports = {
  solana: { tvl },
}