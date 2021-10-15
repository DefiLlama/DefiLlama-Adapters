const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");
const { toUSDTBalances } = require("../helper/balances");

const staking = async (timestamp) => {
  let totalLiquidityUSD = 0;

  const allPages = (
    await utils.fetchURL(
      "https://mainnet-api.fractional.art/vaults?perPage=12&page=1"
    )
  ).data.metadata.pagination.total_pages;

  for (let pag = 1; pag < allPages; pag++) {
    var tvlCurator = (
      await utils.fetchURL(
        `https://mainnet-api.fractional.art/vaults?perPage=12&page=${pag}`
      )
    ).data.data
      .map((cls) => ({
        isClosed: cls.isClosed.toString(),
        analytics: cls.analytics,
      }))
      .filter((closed) => closed.isClosed.includes("false"))
      .map((anly) => anly.analytics)
      .filter(Boolean)
      .map((mcu) => mcu.marketCapUsd)
      .concat(tvlCurator == undefined ? [] : tvlCurator);
  }
  
  tvlCurator.forEach(function (sup) {
    totalLiquidityUSD += sup;
  });

  return toUSDTBalances(totalLiquidityUSD);
};

module.exports = {
  misrepresentedTokens: true,
  staking: {
    tvl: staking,
  },
  tvl: sdk.util.sumChainTvls([staking]),
  methodology:
    "Counts the liquidity on all Vaults threw their curator contracts. Metrics come from https://fractional.art/explore",
};
