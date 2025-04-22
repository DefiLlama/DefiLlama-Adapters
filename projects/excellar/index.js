const axios = require('axios');

const HORIZON_URL = 'https://horizon.stellar.org';
const ISSUER = 'GBMAAGRUMXBRG3IG6BPG5LCO7FTE5VIRA3VF64BFII3LXC27GSEYLHKU';
const ASSET_CODE = 'USDXLR';

async function fetch() {
  const url = `${HORIZON_URL}/assets?asset_code=${ASSET_CODE}&asset_issuer=${ISSUER}`;
  const { data } = await axios.get(url);

  const asset = data._embedded?.records?.[0];
  if (!asset) throw new Error('No asset records found');

  const authorizedStr = asset.balances?.authorized;
  const authorized = parseFloat(authorizedStr);
  if (isNaN(authorized)) throw new Error('Authorized balance is not a number');
  return authorized
}

module.exports = {
  timetravel: false,
  methodology: 'Fetches the USDXLR authorized balance from the Stellar Horizon API /assets endpoint, representing total circulating supply.',
  fetch,
};

