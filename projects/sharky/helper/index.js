const anchor = require("@project-serum/anchor");
const { getProvider, tokens } = require("../../helper/solana");

const SHARKY_PROGRAM_ID = "SHARKobtfF1bHhxD2eqftjHBdVSCbKo9JtgK71FhELP";
const SHARKY_IDL = require("./sharky.json");

async function getVolumes() {
  const provider = getProvider();
  const program = new anchor.Program(SHARKY_IDL, SHARKY_PROGRAM_ID, provider);

  const loans = await program.account.loan.all();
  const offeredLoans = loans.filter((loan) => loan.account.loanState.offer);
  const takenLoans = loans.filter((loan) => loan.account.loanState.taken);

  const offeredVolume = offeredLoans.reduce(
    (acc, l) => acc + l.account.principalLamports.toNumber(),
    0
  );
  const borrowedVolume = takenLoans.reduce(
    (acc, l) => acc + l.account.principalLamports.toNumber(),
    0
  );
  const totalVolume = offeredVolume + borrowedVolume;

  return {
    totalVolume,
    offeredVolume,
    borrowedVolume,
  };
}

module.exports = {
  tvl: async () => ({ [tokens.solana]: (await getVolumes()).totalVolume }),
  offers: async () => ({ [tokens.solana]: (await getVolumes()).offeredVolume }),
  borrowed: async () => ({
    [tokens.solana]: (await getVolumes()).borrowedVolume,
  }),
};
