const { PublicKey } = require("@solana/web3.js");
const { getConnection } = require("../helper/solana");

async function tvl() {
  // https://jito.network/staking
  const connection = getConnection();
  const account = await connection.getAccountInfo(new PublicKey('Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb'))
  return {
    solana: Number(account.data.readBigUint64LE(258))/1e9
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "Uses the SPL Stake Pool SDK to fetch the total supply of deposited SOL into the Jito Stake Pool",
  solana: {
    tvl,
  },
};
