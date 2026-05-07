const { sumTokens2 } = require("../helper/chain/cardano");
const { getConfig } = require("../helper/cache");
const { get } = require("../helper/http");
const { defaultClarityAddresses } = require("./dao-treasury-addresses");

const ADDRESSES_API_URL =
  "https://api.clarity.vote/metrics/getDefiLlamaAddresses";
const CACHE_KEY = "clarity/defillama-addresses";
const REQUEST_TIMEOUT_MS = 15_000;

function extractAddresses(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.addresses)) return response.addresses;
  if (Array.isArray(response?.data?.addresses)) return response.data.addresses;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

async function getTreasuryAddresses() {
  const response = await getConfig(CACHE_KEY, undefined, {
    fetcher: () => get(ADDRESSES_API_URL, { timeout: REQUEST_TIMEOUT_MS }),
  });
  let addresses = extractAddresses(response).filter(Boolean);
  if (!addresses.length) {
    addresses = defaultClarityAddresses;
  }
  return addresses;
}

async function tvl() {
  const owners = await getTreasuryAddresses();
  return await sumTokens2({
    owners,
  });
}

module.exports = {
  cardano: {
    tvl,
  },
};
