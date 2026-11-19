const { getProvider, sumTokens2, } = require('../helper/solana')
const { Program, } = require("@project-serum/anchor")

const PROGRAM_ID = 'FUTARELBfJfQ8RDGhg1wdhddq1odMAJUePHFuBYfUxKq' // Futarchy AMM program


/**
 * Counts tokens held in Futarchy AMM DAO vaults.
 * @param {object} api
 */
async function tvl(api) {

  const provider = getProvider()
  const idl = await Program.fetchIdl(PROGRAM_ID, provider)
  idl.instructions = []
  idl.accounts = idl.accounts.filter(i => i.name === 'Dao')
  const program = new Program(idl, PROGRAM_ID, provider)
  const data = await program.account.dao.all()
  const tokenAccounts = []
  data.forEach(i => {
    tokenAccounts.push(i.account.amm.ammBaseVault)
    tokenAccounts.push(i.account.amm.ammQuoteVault)
  })
  return sumTokens2({ api, tokenAccounts, })
}

module.exports = {
  timetravel: false,
  methodology: "Value of tokens locked in Futarchy AMM liquidity pools.",
  solana: {
    tvl,
  },
};