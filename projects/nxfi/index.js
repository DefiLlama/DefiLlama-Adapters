const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, } = require("../helper/solana");
const BigNumber = require("bignumber.js");
const Decimal = require("./decimal")

const idl = require('./idl')

function wrappedI80F48toBigNumber ({value}, scaleDecimal) {
  if (!value) return new BigNumber(0)

  const numbers = new Decimal(`${value.isNeg() ? '-' : ''}0b${value.abs().toString(2)}p-48`)
  return new BigNumber(numbers.toString())
}

async function tvl() {
  const provider = getProvider()
  const program = new Program(idl, 'NxFiv1eeKtKT6dQEP2erBwz2DSKCTdb8WSsxVDwVGJ1', provider)
  const reserves = await program.account.reserve.all()
  return sumTokens2({ tokenAccounts: reserves.map(r => r.account.tokenInfo.tokenAccount.toString()) });
}
async function borrowed() {
  const provider = getProvider()
  const program = new Program(idl, 'NxFiv1eeKtKT6dQEP2erBwz2DSKCTdb8WSsxVDwVGJ1', provider)
  const reserves = await program.account.reserve.all()
  const res = reserves.map(r=>{
    const amount = wrappedI80F48toBigNumber(r.account.creditDebit.debtNtokenRatio).times(wrappedI80F48toBigNumber(r.account.creditDebit.reserveDebtNtokenAmount)).toString()
    const mint = r.account.tokenMint.toString()
    return {mint,amount}
  })
  let balances = {}
  for(let i=0;i<res.length;i++) {
    balances[`solana:${res[i].mint}`] = Number(res[i].amount).toFixed(0)
  }
  return balances;
}

module.exports = {
  timetravel: false,
  solana: { tvl,borrowed },
}
