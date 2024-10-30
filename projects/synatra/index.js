const { getConnection,} = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const ySOL_MINT = 'yso11zxLbHA3wBJ9HAtVu6wnesqz9A2qxnhxanasZ4N';
const yUSD_MINT = 'yUSDX7W89jXWn4zzDPLnhykDymSjQSmpaJ8e4fjC1fg';
const TOKEN_MINTS = [ySOL_MINT, yUSD_MINT]

async function tvl(api) {
  const connection = getConnection();
  for (const mint of TOKEN_MINTS) {
    const accountInfo = await connection.getAccountInfo(new PublicKey(mint));
    const supply = accountInfo.data.readBigUInt64LE(36);
    api.add(mint, supply)
  }
}

module.exports = {
  methodology: 'Tracks tvl via number of tokens currently minted for each pool.',
  solana: { tvl, },
}
