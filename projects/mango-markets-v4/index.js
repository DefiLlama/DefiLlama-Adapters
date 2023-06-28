const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, } = require("../helper/solana");
const idl = require('./idl.json')

async function tvl() {
  const provider = getProvider()
  const program = new Program(idl, '4MangoMjqJ2firMokCjjGgoK8d4MXcrgL7XJaL3w6fVg', provider)
  const banks = await program.account.bank.all()
  return sumTokens2({ tokenAccounts: banks.map(i => i.account.vault) })
}

module.exports = {
  timetravel: false,
  solana: { tvl },
}
