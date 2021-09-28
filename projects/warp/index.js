const sdk = require("@defillama/sdk");
const axios = require("axios");
const { getApiTvl } = require("../helper/historicalApi");

const historicalUrl =
  "https://29ivsn1ltd.execute-api.us-west-1.amazonaws.com/staging//protocol/chart?count=1440";
const currentUrl =
  "https://29ivsn1ltd.execute-api.us-west-1.amazonaws.com/staging//protocol/value";

const ethTvl = async (timestamp) => {
  return getApiTvl(
    timestamp,
    async function current() {
      let response = await axios.get(currentUrl);
      return response.data.totalValueLocked;
    },
    async function historical() {
      let response = await axios.get(historicalUrl);
      response.data.map((d) => ({
        date: d.timestamp / 1000,
        totalLiquidityUSD: d.totalValueLocked,
      }));
    }
  );
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
  methodology:
    "We count the liquidity on all AMM Vaults and Geyser. Metrics come from https://vision.warp.finance/",
};
