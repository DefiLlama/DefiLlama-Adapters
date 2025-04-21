const axios = require('axios');

const HORIZON_URL = 'https://horizon.stellar.org';
const ISSUER = 'GBMAAGRUMXBRG3IG6BPG5LCO7FTE5VIRA3VF64BFII3LXC27GSEYLHKU';
const ASSET_CODE = 'USDXLR';

const api = axios.create({
  timeout: 60000, // 60 seconds per request
  headers: { 'Accept-Encoding': 'gzip' }
});

async function fetchTvl() {
  let total = 0;
  let next = `${HORIZON_URL}/accounts?asset=${ASSET_CODE}:${ISSUER}&limit=200`;
  let retryCount = 0;
  const maxRetries = 8;
  let delay = 10000; // 10 seconds

  while (next) {
    try {
      const { data } = await api.get(next);

      data._embedded.records.forEach(account => {
        const balance = account.balances.find(
          b => b.asset_code === ASSET_CODE && b.asset_issuer === ISSUER
        );
        if (balance) total += parseFloat(balance.balance);
      });

      next = data._links.next?.href || null;
      retryCount = 0;
      delay = 10000; // Reset delay on success

    } catch (error) {
      if (retryCount >= maxRetries) {
        throw new Error(`Horizon API unreachable after ${maxRetries} retries`);
      }
      if (error.code === 'ETIMEDOUT' || error.response?.status === 429 || error.response?.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        retryCount++;
        continue;
      }
      throw error;
    }
  }

  return { usd: total };
}

module.exports = {
  timetravel: false,
  methodology: 'Sums all USDXLR balances across Stellar trustlines using the Horizon API.',
  stellar: { fetch: fetchTvl }
};

