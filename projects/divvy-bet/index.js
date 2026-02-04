const ADDRESSES = require('../helper/coreAssets.json')
const { Program } = require("@project-serum/anchor");
const { PublicKey } = require("@solana/web3.js");
const { getProvider, sumTokens2 } = require("../helper/solana");

async function tvl() {
  function findHouseAuthorityAddress(houseKey, programId) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("House Authority"), houseKey.toBuffer()],
      programId
    )[0];
  }

  const NATIVE_MINT = ADDRESSES.solana.SOL;
  const DIVVY_ADMIN = "AHf1MX99d31ebLfAydVPe2vVdgzZGuUaW972znWPNzZY";

  const programId = new PublicKey("dvyFwAPniptQNb1ey4eM12L8iLHrzdiDsPPDndd6xAR");
  const provider = getProvider();
  const idl = await Program.fetchIdl(programId, provider);
  const program = new Program(idl, programId, provider);
  const houses = await program.account.house.all([
    {
      memcmp: {
        offset: 8,
        bytes: DIVVY_ADMIN, // houses governed by Divvy's multisig
      },
    },
  ]);
  const tokensAndOwners = houses
    .filter((house) => house.account.currency.toBase58() !== NATIVE_MINT)
    .map((house) => {
      const owner = findHouseAuthorityAddress(house.publicKey, programId);
      return [house.account.currency, owner];
    });
  const solOwners = houses
    .filter((house) => house.account.currency.toBase58() === NATIVE_MINT)
    .map((house) => {
      return findHouseAuthorityAddress(house.publicKey, programId);
    });
  return sumTokens2({ tokensAndOwners, solOwners });
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
};
