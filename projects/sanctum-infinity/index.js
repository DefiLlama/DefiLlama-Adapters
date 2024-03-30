const { decodeAccount, getConnection } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

async function tvl() {
  const connection = getConnection();
  const poolInfoAccount = await connection.getAccountInfo(
    new PublicKey("AYhux5gJzCoeoc1PoJ1VxwPDe22RwcvpHviLDD1oCGvW")
  );
  const decoded = decodeAccount("sanctumInfinity", poolInfoAccount);
  const tvlInfinity = decoded.totalSolValue.toNumber() / 1e9;

  return {
    solana: tvlInfinity,
  };
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is calculated by calling the on-chain state of the Infinity pool",
  solana: { tvl },
};
