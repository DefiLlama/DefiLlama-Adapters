const axios = require('axios');

const HORIZON_URL = 'https://horizon.stellar.org';
const ISSUER = 'GBMAAGRUMXBRG3IG6BPG5LCO7FTE5VIRA3VF64BFII3LXC27GSEYLHKU';
const ASSET_CODE = 'USDXLR';

const tvl = async (api) => {
  const url = `${HORIZON_URL}/assets?asset_code=${ASSET_CODE}&asset_issuer=${ISSUER}`;
  const { data } = await axios.get(url);

  const asset = data._embedded?.records?.[0];
  const authorizedStr = asset.balances?.authorized;
  const authorized = parseFloat(authorizedStr);
  api.addUSDValue(authorized)
}

module.exports = {
  stellar: { tvl }
}
