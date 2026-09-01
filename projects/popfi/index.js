const { sumTokens2, } = require('../helper/solana')
const { PublicKey } = require("@solana/web3.js");
const anchor = require("@project-serum/anchor");
const POPFI_PROGRAM_ID = new PublicKey(
  "AfjPnJz75bJiMKYeManVmPVQEGNcSaj9KeF6c5tncQEa"
);


async function tvl() {
  const vault = PublicKey.findProgramAddressSync(
    [Buffer.from(anchor.utils.bytes.utf8.encode("PDAHouseWallet"))],
    POPFI_PROGRAM_ID
  )[0].toBase58();
  // https://docs.parcl.co/addresses
  return sumTokens2({ solOwners: [vault] })
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}