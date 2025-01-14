const { getTokenSupplies,} = require("../helper/solana");

const ySOL_MINT = 'yso11zxLbHA3wBJ9HAtVu6wnesqz9A2qxnhxanasZ4N';
const yUSD_MINT = 'yUSDX7W89jXWn4zzDPLnhykDymSjQSmpaJ8e4fjC1fg';
const TOKEN_MINTS = [ySOL_MINT, yUSD_MINT]

async function tvl(api) {
  await getTokenSupplies(TOKEN_MINTS, {api  })
}

module.exports = {
  doublecounted: true,
  methodology: 'Tracks tvl via number of tokens currently minted for each pool.',
  solana: { tvl, },
}
