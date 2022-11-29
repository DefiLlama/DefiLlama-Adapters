const sdk = require("@defillama/sdk");
const axios = require("axios");

const API_ENDPOINT = "https://api.furucombo.app/v1/investables/farm_tvl";
const API_KEY = "VDNl6XunwQaTYWtvMZ6Qqa2GeVtSqzqo8Mrquo4O";

async function polygon(timestamp, blockETH, chainBlocks) {
  const balances = {};

  const { data } = await axios.get(API_ENDPOINT, {
        params: { block: chainBlocks["polygon"] },
        headers: { ["X-Api-Key"]: API_KEY },
      })

  for (const { token, balance } of data.balances) {
    sdk.util.sumSingleBalance(balances, "polygon:" + token.address, balance);
  }

  return balances;
}

module.exports = {
  polygon: {
    tvl: polygon,
  },
};
