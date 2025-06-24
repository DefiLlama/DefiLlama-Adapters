const axios = require("axios");

//const API_URL = "http://localhost:3000/tokens/v1/price/info"; // Dev
const API_URL = "https://cockpit.wuzu.io/tokens/v1/price/info"; // Prod
const ADAPTER_NAME = "mercado-bitcoin";
const START_TIMESTAMP = 1704067200; // Jan 1, 2024

const methodology = "TVL is calculated per blockchain network by summing the market capitalization of all RWA tokens issued by Mercado Bitcoin. Each token's value is computed as total_supply_normalized × USD price, with data fetched from the public API.";

// List of networks to be monitored initially
const networks = ["xdc", "plume", "polygon"];

function createTvlFunction(network) {
  return async function tvl() {
    try {
      const { data } = await axios.get(API_URL);
      const tokens = Array.isArray(data) ? data : data?.values || [];

      const filtered = tokens.filter(
        (t) =>
          t.defillama_network &&
          t.defillama_network.toLowerCase() === network.toLowerCase() &&
          t.pu_usd &&
          t.total_supply_normalized
      );

      const total = filtered.reduce((acc, token) => {
        return acc + token.pu_usd * token.total_supply_normalized;
      }, 0);

      return { usd: total };
    } catch (err) {
      console.error(`[${ADAPTER_NAME}] Error fetching or processing tokens:`, err.message);
      return { usd: 0 };
    }
  };
}

module.exports = {
  methodology,
  start: START_TIMESTAMP,
  timetravel: false,
};

for (const network of networks) {
  module.exports[network] = {
    tvl: createTvlFunction(network),
  };
}
