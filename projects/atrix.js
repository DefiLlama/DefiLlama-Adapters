const retry = require('./helper/retry');
const axios = require('axios');

async function fetch() {
  const response = (
    await retry(
      async (bail) => await axios.get('https://api.atrix.finance/api/tvl')
    )
  ).data;

  const tvl = response.tvl;

  return tvl || 0;
}

module.exports = {
  methodology: "The Atrix API endpoint fetches on-chain data from the Serum orderbook and token accounts for each liquidity pool, then uses prices from Coingecko to aggregate total TVL.",
  fetch,
};
