const sdk = require("@defillama/sdk");
const { get } = require("../helper/http");
const { transformBalances } = require("../helper/portedTokens");
const ADDRESSES = require("../helper/coreAssets.json");
const { BASE_API_URL, POOL_ADDRESS } = require("./constants");
const nullAddress = ADDRESSES.null;

async function tvl(chain, timestamp, chainBlocks, { api }) {
  const balances = {};
  const result = await get(`${BASE_API_URL}/api/v1/analytics/borrowed`);
  sdk.util.sumSingleBalance(balances, nullAddress, result.value, api.chain);
  const balance = await get(`https://toncenter.com/api/v2/getAddressBalance?address=${encodeURIComponent(POOL_ADDRESS)}`)
  sdk.util.sumSingleBalance(balances, nullAddress, balance.result, api.chain);
  return transformBalances(api.chain, balances);
}

module.exports = {
  tvl,
}
