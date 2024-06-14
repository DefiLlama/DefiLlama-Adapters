const { getProvider, sumTokens2, } = require('../helper/solana')
const { Program, } = require("@project-serum/anchor");

module.exports = {
  solana: {
    tvl
  },
}

async function tvl(api) {
  const provider = getProvider()
  const programId = 'dp2waEWSBy5yKmq65ergoU3G6qRLmqa6K7We4rZSKph'
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const data = await program.account.market.all()
  const tokenAccounts = data.map(({ account: i}) => [i.t0Vault, i.t1Vault]).flat()
  return sumTokens2({ tokenAccounts, })
}