const sdk = require("@defillama/sdk");
const { get } = require("../helper/http");
const { transformBalances } = require("../helper/portedTokens");
const ADDRESSES = require("../helper/coreAssets.json");
const { BASE_API_URL } = require("./constants");
const nullAddress = ADDRESSES.null;

async function tvl(chain, timestamp, chainBlocks, { api }) {
  const balances = {};
  const result = await get(`${BASE_API_URL}/api/v1/analytics/tvl`);
  sdk.util.sumSingleBalance(balances, nullAddress, result.value, api.chain);
  return transformBalances(api.chain, balances);
}

module.exports = {
  tvl,
}
