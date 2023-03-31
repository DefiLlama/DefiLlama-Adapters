const anchor = require("@project-serum/anchor");
const { getProvider, tokens } = require("../../helper/solana");

const SHARKY_PROGRAM_ID = "SHARKobtfF1bHhxD2eqftjHBdVSCbKo9JtgK71FhELP";
const SHARKY_IDL = require("./sharky.json");

async function getVolumes() {
  const provider = getProvider();
  const program = new anchor.Program(SHARKY_IDL, SHARKY_PROGRAM_ID, provider);

  const loans = await program.account.loan.all();
  const totalVolume = loans.reduce(
    (acc, l) => acc + l.account.principalLamports.toNumber(),
    0
  );

  return {
    totalVolume,
  };
}

module.exports = {
  tvl: async () => ({ [tokens.solana]: (await getVolumes()).totalVolume }),
};
