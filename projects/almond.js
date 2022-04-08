const retry = require('./helper/retry');
const axios = require('axios');

async function fetch() {
  const response = (
    await retry(
      async (bail) => await axios.get('https://api.almond.so/api/tvl')
    )
  ).data;

  return response.tvl;
}

module.exports = {
  timetravel: false,
  methodology: "The pools on https://almond.so/ are included in TVL. Standard tokens (SOL, BTC, ETH, USDC, etc..), no pool 2. The API fetches the balances of the Solana accounts holding the staked tokens, then uses Coingecko prices to determine dollar values.",
  fetch,
};
