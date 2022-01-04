const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");

const graphUrl =
  "https://api.thegraph.com/subgraphs/name/blockzerohello/flash-stake-stats-v2-subgraph";
const graphQuery = gql`
  query get_tvl($block: Int) {
    flashFactories(block: { number: $block }) {
      totalVolumeUSD
      totalLiquidityUSD
    }
  }
`;

async function tvl(timestamp, block) {
  const { flashFactories } = await request(graphUrl, graphQuery, {
    block,
  });
  const usdTvl = Number(flashFactories[0].totalLiquidityUSD);
  return toUSDTBalances(usdTvl);
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl,
  },
  tvl,
};
