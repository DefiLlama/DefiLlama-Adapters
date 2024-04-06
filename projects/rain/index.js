const { Program } = require("@project-serum/anchor");
const bs58 = require('bs58');
const { getProvider } = require("../helper/solana");
const idl = require('./idl')

async function tvl(api) {
  const provider = getProvider()
  const program = new Program(idl, 'RainEraPU5yDoJmTrHdYynK9739GkEfDsE4ffqce2BR', provider)

  const pools = await program.account.pool.all()
  const loans = await program.account.loan.all([
    {
      memcmp: {
        offset: 294 + 8,
        bytes: bs58.encode(Buffer.from([1])), // tokens loans only
      },
    },
    {
      memcmp: {
        offset: 8 + 1,
        bytes: bs58.encode(Buffer.from([0])), // active loans only
      },
    },
  ])

  for (const loan of loans) {
    api.add(loan.account.mint.toString(), loan.account.collateralAmount)
  }

  for (const pool of pools)
    api.add(pool.account.currency.toString(), pool.account.availableAmount)
}

async function borrowed(api) {
  const provider = getProvider()
  const program = new Program(idl, 'RainEraPU5yDoJmTrHdYynK9739GkEfDsE4ffqce2BR', provider)
  const pools = await program.account.pool.all()

  for (const pool of pools)
    api.add(pool.account.currency.toString(), pool.account.borrowedAmount)
}

module.exports = {
  solana: { tvl, borrowed, },
}