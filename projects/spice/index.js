const { sumTokens2 } = require('../helper/solana');
const { PublicKey } = require('@solana/web3.js');

async function tvl() {
  const programId = new PublicKey('CcoYv1X4RczUmuGCUw3Vg1XWxspaofsh8dtD26cmN7nm');

  const SPICE_SEED = Buffer.from("SPICE");
  const TREASURY_SEED = Buffer.from("TREASURY");

  const [treasuryAccount] = PublicKey.findProgramAddressSync(
    [SPICE_SEED, TREASURY_SEED],
    programId
  );

  return sumTokens2({ tokenAccounts: [treasuryAccount.toBase58()] });
}

module.exports = {
  timetravel: false,
  solana: { tvl },
};

