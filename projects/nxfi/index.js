const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, } = require("../helper/solana");

const idl = require('./idl')

async function tvl() {
  const provider = getProvider()
  const program = new Program(idl, 'NxFiv1eeKtKT6dQEP2erBwz2DSKCTdb8WSsxVDwVGJ1', provider)
  const reserves = await program.account.reserve.all()

  return sumTokens2({ tokenAccounts: reserves.map(r => r.account.tokenInfo.tokenAccount.toString()) });
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}
