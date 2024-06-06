const { Program } = require("@project-serum/anchor");
const { PublicKey } = require("@solana/web3.js");
const { getProvider, sumTokens2 } = require("../helper/solana");

async function tvl() {
  const whitelistedHouseKeys = [
    "hausUZLF38ZRqZdQvNLVoAFe7FAFoAzyS5oLpQCgPWz", // USDC
    "hausNgPX6qShZUnGCj97UmKfzrtKLi4UNoBG6Aju3Ye", // USDT
    "hausCYdqR6mUN58ZdonzMZKXVcaC26yh7EuaN6nZDtU", // Bonk
    "hausZ4fWKatkg2p59yQipaXJBTMAGcVQ6kF85SaQNj6", // PYTH
    "hausPNwKGhEQz6QCmbXkoxpvws2mNeGs1xLg5NKNZwe", // Jupiter
    "hausURZDvoMvLnUwPRiZYei8MMBwx2VdZQmAd4qyJTw", // Wormhole
  ];
  const programId = new PublicKey(
    "dvyFwAPniptQNb1ey4eM12L8iLHrzdiDsPPDndd6xAR"
  );
  const provider = getProvider();
  const idl = await Program.fetchIdl(programId, provider);
  const program = new Program(idl, programId, provider);
  const houses = await program.account.house.all();
  const tokensAndOwners = houses
    .filter((house) =>
      whitelistedHouseKeys.includes(house.publicKey.toBase58())
    )
    .map((house) => {
      const owner = PublicKey.findProgramAddressSync(
        [Buffer.from("House Authority"), house.publicKey.toBuffer()],
        programId
      )[0];
      return [house.account.currency, owner];
    });
  const solOwners = PublicKey.findProgramAddressSync(
    [
      Buffer.from("House Authority"),
      "haus4QCRft9QKj2iQL9MUiQ2P6uYnWVyhFEZ3QsSa5U",
    ],
    programId
  )[0];
  return sumTokens2({ tokensAndOwners, solOwners });
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
};
