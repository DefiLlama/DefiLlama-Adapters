const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2 } = require("../helper/solana");
const idl = require('./idl')

async function tvl() {
  const provider = getProvider()
  const program = new Program(idl, idl.metadata.address, provider)

  const pools = await program.account.poolState.all()
  const tokenAccounts = pools.map(i => i.account.poolTokenArray).flat().filter(i => +i.balance > 0).map(i => i.accountKey)
  return sumTokens2({ tokenAccounts })
}

module.exports = {
  solana: { tvl, },
}