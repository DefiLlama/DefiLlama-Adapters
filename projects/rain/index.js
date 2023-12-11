const { Program } = require("@project-serum/anchor");
const { getProvider } = require("../helper/solana");
const idl = require('./idl')

async function tvl(_, _b, _cb, { api, }) {
  const provider = getProvider()
  const program = new Program(idl, 'RainEraPU5yDoJmTrHdYynK9739GkEfDsE4ffqce2BR', provider)
  const pools = await program.account.pool.all()

  for (const pool of pools)
    api.add(pool.account.currency.toString(), pool.account.availableAmount)
}

async function borrowed(_, _b, _cb, { api, }) {
  const provider = getProvider()
  const program = new Program(idl, 'RainEraPU5yDoJmTrHdYynK9739GkEfDsE4ffqce2BR', provider)
  const pools = await program.account.pool.all()

  for (const pool of pools)
    api.add(pool.account.currency.toString(), pool.account.borrowedAmount)
}

module.exports = {
  solana: { tvl, borrowed, },
}