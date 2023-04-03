const anchor = require("@project-serum/anchor");
const { getProvider, } = require("../../helper/solana");

const SHARKY_PROGRAM_ID = "SHARKobtfF1bHhxD2eqftjHBdVSCbKo9JtgK71FhELP";
const SHARKY_IDL = require("./sharky.json");

async function borrowed(timestamp, _, _1, { api }) {
  const provider = getProvider();
  const program = new anchor.Program(SHARKY_IDL, SHARKY_PROGRAM_ID, provider);

  let loans = await program.account.loan.all()
  loans = loans.map(i => i.account)
  api.log('loan count: ',loans.length)
  loans = loans.filter(i => {

    const time = i.loanState?.taken?.taken?.terms?.time
    if (!time) return false
    return +time.start + +time.duration > timestamp
  })
  api.log('active count: ',loans.length)
  loans.forEach(i => api.add(i.valueTokenMint, i.principalLamports.toString()))
}

module.exports = {
  tvl: () => 0,
  borrowed,
};
