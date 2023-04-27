const { getChainTvl } = require("../helper/getHydraV3SubgraphTvl");

const v3graph = getChainTvl(
  {
    hydra: "https://graph.hydradex.org/subgraphs/name/v3-subgraph",
  },
  "factories",
  "totalValueLockedUSD"
);

module.exports = {
  timetravel: false,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from https://graph.hydradex.org/subgraphs/name/v3-subgraph`,
  hydra: {
    tvl: v3graph("hydra"),
  },
};
