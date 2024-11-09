const { PublicKey } = require("@solana/web3.js");
const { getConnection } = require("../helper/solana");

async function tvl() {
  const connection = getConnection();
  const account = await connection.getAccountInfo(new PublicKey('edgejNWAqkePLpi5sHRxT9vHi7u3kSHP9cocABPKiWZ'))
  return {
    solana: Number(account.data.readBigUint64LE(258))/1e9
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "Uses the SPL Stake Pool SDK to fetch the total supply of deposited SOL into the Edgevana Stake Pool",
  solana: {
    tvl,
  },
};
