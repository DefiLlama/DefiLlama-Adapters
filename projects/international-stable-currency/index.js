const { PublicKey } = require("@solana/web3.js");
const { getConnection, decodeAccount } = require("../helper/solana");

async function tvl(api) {
  const connection = getConnection();
  const ISC = "J9BcrQfX4p9D1bvLzRNCbMDv8f44a9LFdeqNE4Yk2WMD"
  const mint = await connection.getAccountInfo(new PublicKey(ISC))
  const mintInfo = decodeAccount("mint", mint);
  api.add(ISC, mintInfo.supply)
}

module.exports = {
  timetravel: false,
  methodology: "Supply of ISC multiplied by the price of ISC in USD.",
  solana: {
    tvl,
  },
};