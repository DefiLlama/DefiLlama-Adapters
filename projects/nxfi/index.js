const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, i80f48ToNumber, } = require("../helper/solana");

const idl = require('./idl')


async function tvl() {
  const provider = getProvider()
  const program = new Program(idl, 'NxFiv1eeKtKT6dQEP2erBwz2DSKCTdb8WSsxVDwVGJ1', provider)
  const reserves = await program.account.reserve.all()
  return sumTokens2({ tokenAccounts: reserves.map(r => r.account.tokenInfo.tokenAccount.toString()) });
}

async function borrowed(api) {
  const provider = getProvider()
  const program = new Program(idl, 'NxFiv1eeKtKT6dQEP2erBwz2DSKCTdb8WSsxVDwVGJ1', provider)
  const reserves = await program.account.reserve.all()
  reserves.map(r => {
    const amount = i80f48ToNumber(r.account.creditDebit.debtNtokenRatio) * i80f48ToNumber(r.account.creditDebit.reserveDebtNtokenAmount)
    const mint = r.account.tokenMint.toString()
    api.add(mint, amount)
  })
}

module.exports = {
  timetravel: false,
  solana: { tvl, borrowed },
}
