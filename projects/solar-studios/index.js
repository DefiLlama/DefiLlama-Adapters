const { getProvider, sumTokens2 } = require("../helper/solana");
const { Program, } = require("@project-serum/anchor");


async function tvl(api) {

  const provider = getProvider(api.chain)
  const programId = 'sooGfQwJ6enHfLTPfasFZtFR7DgobkJD77maDNEqGkD'
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const data = await program.account.poolState.all()
  const tokenAccounts = data.map(({ account: { token0Vault, token1Vault }}) => ([token0Vault, token1Vault,])).flat()
  return sumTokens2({ tokenAccounts, api, })
}

module.exports = {
  timetravel: false,
  eclipse: { tvl, },
}
