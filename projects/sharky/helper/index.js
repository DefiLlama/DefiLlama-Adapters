const anchor = require("@project-serum/anchor");
const { getProvider, } = require("../../helper/solana");
const sdk = require('@defillama/sdk')

const { once } = require('../../helper/utils')

const getLoans = once(async () => {
  const provider = getProvider();
  sdk.log('fetching loans...')
  const program = new anchor.Program(SHARKY_IDL, SHARKY_PROGRAM_ID, provider);

  return program.account.loan.all()

})

const SHARKY_PROGRAM_ID = "SHARKobtfF1bHhxD2eqftjHBdVSCbKo9JtgK71FhELP";
const SHARKY_IDL = require("./sharky.json");

async function borrowed(api) {
  let loans = await getLoans()
  loans = loans.map(i => i.account)
  api.log('loan count: ',loans.length)
  loans = loans.filter(i => {

    const time = i.loanState?.taken?.taken?.terms?.time
    if (!time) return false
    return +time.start + +time.duration > api.timestamp
  })
  api.log('active loans count: ',loans.length)
  loans.forEach(i => api.add(i.valueTokenMint.toString(), i.principalLamports.toString()))
}

async function tvl(api) {
  let loans = await getLoans()
  loans = loans.map(i => i.account)
  api.log('loan count: ',loans.length)
  loans = loans.filter(i => {
    return !i.loanState.taken
  })
  api.log('Loans yet to be taken: ',loans.length)
  loans.forEach(i => api.add(i.valueTokenMint.toString(), i.principalLamports.toString()))
}

module.exports = {
  borrowed,
  tvl,
};
