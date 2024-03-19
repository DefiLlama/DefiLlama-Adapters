const { decodeAccount, getConnection } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

async function tvl() {
  const connection = getConnection();
  const poolInfoAccount = await connection.getAccountInfo(
    new PublicKey("Gb7m4daakbVbrFLR33FKMDVMHAprRZ66CSYt4bpFwUgS")
  );
  const decoded = decodeAccount("sanctumLstStateList", poolInfoAccount);
  console.log(decoded);

  // return {
  //   solana: tvlInfinity,
  // };
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is calculated by calling the on-chain state of the Infinity pool",
  solana: { tvl },
};
