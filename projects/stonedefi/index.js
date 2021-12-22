const axios = require("axios");
const { getPricesfromString } = require("../helper/utils");
const { toUSDTBalances } = require("../helper/balances");
const sdk = require("@defillama/sdk");

async function tvls(timestamp) {
  const res = await axios.get("https://api.stonedefi.io/api/common");
  data = res.data.data;
  return toUSDTBalances(data.tvl);
}

module.exports = {
  misrepresentedTokens: true,
  tvl: sdk.util.sumChainTvls([tvls]),
};
