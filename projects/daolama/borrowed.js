const sdk = require("@defillama/sdk");
const { transformBalances } = require("../helper/portedTokens");
const { get } = require('../helper/http');
const ADDRESSES = require('../helper/coreAssets.json');
const { BASE_API_URL } = require("./constants");
const nullAddress = ADDRESSES.null;

async function borrowed(chain, timestamp, chainBlocks, { api }) {
  const balances = {};
  const result = await get(`${BASE_API_URL}/api/v1/analytics/borrowed`);
  sdk.util.sumSingleBalance(balances, nullAddress, result.value, api.chain);
  return transformBalances(api.chain, balances);
}

module.exports = {
  borrowed,
}
