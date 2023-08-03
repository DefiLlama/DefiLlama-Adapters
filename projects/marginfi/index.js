const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, } = require("../helper/solana");
const idl = require('./idl')

async function tvl() {
  const provider = getProvider()
  const program = new Program(idl, 'MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA', provider)
  const banks = await program.account.bank.all()
  return sumTokens2({ tokenAccounts: banks.map(i => i.account.liquidityVault.toString()) })
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}
