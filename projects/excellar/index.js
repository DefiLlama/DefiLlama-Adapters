const axios = require('axios');

const HORIZON_URL = 'https://horizon.stellar.org';
const ISSUER = 'GBMAAGRUMXBRG3IG6BPG5LCO7FTE5VIRA3VF64BFII3LXC27GSEYLHKU';
const ASSET_CODE = 'USDXLR';

const api = axios.create({
  timeout: 30000,
  headers: { 'Accept-Encoding': 'gzip' }
});

async function fetchTvl() {
  const ASSET_ENDPOINT = `${HORIZON_URL}/assets?asset_code=${ASSET_CODE}&asset_issuer=${ISSUER}`;

  try {
    const { data } = await api.get(ASSET_ENDPOINT);

    if (!data._embedded || !data._embedded.records || data._embedded.records.length === 0) {
      throw new Error('No asset records found');
    }

    const asset = data._embedded.records[0];
    const tvl = parseFloat(asset.balances.authorized); // Extract authorized balance
    return { usd: tvl };

  } catch (error) {
    console.error('Error fetching TVL:', error);
    throw error;
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Fetches the USDXLR authorized balance from the /assets endpoint on the Stellar Horizon API, representing total circulating supply.',
  stellar: { fetch: fetchTvl }
};

