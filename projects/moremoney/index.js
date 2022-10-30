const { default: BigNumber } = require("bignumber.js");

const useStrategyMetadata = require("./StrategyMetadata").useStrategyMetadata;
const useLegacyIsolatedStrategyMetadata =
  require("./StrategyMetadata").useLegacyIsolatedStrategyMetadata;
const useParsedStakingMetadata =
  require("./StakingMetadata").useParsedStakingMetadata;

async function tvl(_, _b, { avax: block }) {
  const [allStratMeta, legacyStratMeta] = await Promise.all([
    useStrategyMetadata(block), useLegacyIsolatedStrategyMetadata(block)
  ])
  const stratMeta = [...allStratMeta, ...legacyStratMeta]
  const stakeMeta = await useParsedStakingMetadata(block);

  const tvlsFarm = stakeMeta
    .reduce((tvl, row) => {
      return tvl + +row.tvl
    }, 0);

  const tvlNoFarm = stratMeta
    .reduce(
      (tvl, row) => tvl + (row.tvl * row.valuePer1e18 / 1e18),
      0);

  const tvl = tvlNoFarm + tvlsFarm

  return {
    "usd-coin": BigNumber(tvl / 1e18).toFixed(0),
  };
}

module.exports = {
  misrepresentedTokens: true,
  avax: {
    tvl,
  },
};
