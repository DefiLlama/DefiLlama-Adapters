const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");
const { toUSDTBalances } = require("../helper/balances");

const api_url = "https://ttswap.space/api/info/?1634761489353";

const thundercoreTvl = async () => {
  const tvl = (await utils.fetchURL(api_url)).data.data.overview.liquidity;
  return toUSDTBalances(tvl);
};

module.exports = {
  ThunderCore: {
    tvl: thundercoreTvl,
  },
  tvl: sdk.util.sumChainTvls([thundercoreTvl]),
  methodology:
    "Counts the liquidity on all pairs. Metrics come from https://ttswap.space/#/stats",
};
