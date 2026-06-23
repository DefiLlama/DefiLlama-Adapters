const { PublicKey } = require("@solana/web3.js");
const { getConnection } = require("../helper/solana");

async function tvl() {
  const connection = getConnection();
  const account = await connection.getAccountInfo(new PublicKey('StKeDUdSu7jMSnPJ1MPqDnk3RdEwD2QbJaisHMebGhw'))
  return {
    solana: Number(account.data.readBigUint64LE(258))/1e9
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "Uses the SPL Stake Pool SDK to fetch the total supply of deposited SOL into the STKE Stake Pool by SOL Strategies (Nasdaq:STKE|CSE:HODL)",
  solana: {
    tvl,
  },
};
