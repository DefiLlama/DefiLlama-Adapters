const { PublicKey } = require("@solana/web3.js");
const { sumTokens2, } = require("../helper/solana");

async function tvl() {
  const textEncoder = new TextEncoder();
  const [bank] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("bank")],
    new PublicKey('FrenAezyygcqNKaCkYNzBAxTCo717wh1bgnKLqnxP8Cq')
  );
  return sumTokens2({ solOwners: [bank.toBase58()] })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
};
