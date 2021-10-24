const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");
const { toUSDTBalances } = require("../helper/balances");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; //I USED THIS TO RUN; Because I had problems with the first certificate!!

const api_url = "https://info.chainge.finance/api/v1/info/map";

const fsnTvl = async () => {
  let totalLiquidityUSD = 0;

  const poolsTvl = (await utils.fetchURL(api_url)).data.data.pools
    .map((p) => p.tvl)
    .forEach(function (tvl) {
      totalLiquidityUSD += tvl;
    });

  return toUSDTBalances(totalLiquidityUSD);
};

module.exports = {
  fusion: {
    tvl: fsnTvl,
  },
  tvl: sdk.util.sumChainTvls([fsnTvl]),
  methodology:
    "Counts the liquidity on all AMM Pools. Metrics come from https://www.chainge.finance/info/pool",
};
