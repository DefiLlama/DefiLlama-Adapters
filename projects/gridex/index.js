const { request, gql } = require("graphql-request");
const { getBlock } = require("../helper/http");
const { sumTokensExport, sumTokens2 } = require("../helper/unwrapLPs");

const graphs = {
  arbitrum:
    "https://api.studio.thegraph.com/proxy/43214/core-subgraph-arbitrum-v2/v0.0.3",
};
const graph =
  "https://api.studio.thegraph.com/proxy/43214/core-subgraph-arbitrum-v2/v0.0.3";

const tvl =
  (chain) =>
  async (_, _b, { [chain]: block }) => {
    block = await getBlock(_, chain, { [chain]: block });

    let graphQuery = gql`
      query gridQuery($block: Int) {
        grids(block: { number: $block }) {
          id
          token0 {
            id
          }
          token1 {
            id
          }
        }
      }
    `;

    const res = await request(graphs[chain], graphQuery, {
      block: block - 5000,
    });

    const tokensAndOwners = res.grids
      .map((i) => [
        [i.token0.id, i.id],
        [i.token1.id, i.id],
      ])
      .flat();

    const balances = {};
    await sumTokens2({
      balances,
      chain: "arbitrum",
      tokensAndOwners,
      block,
      blacklistedTokens: [],
    });

    return balances;
  };

module.exports = {
  methodology: `Counts the tokens locked on order book grid, pulling the data from the 'GridexProtocol/subgraph' subgraph`,
  timetravel: false,
  hallmarks: [
    [1672531200, "GDX Airdrop #1"],
    [1672531200, "GDX Airdrop #2"],
    [1678838400, "Maker Rewards Launch"],
    [1672531200, "GDX Airdrop #3"],
  ],
};

const chains = ["arbitrum"];

chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: tvl(chain),
  };
});
