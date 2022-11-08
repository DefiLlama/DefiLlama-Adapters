const { toUSDTBalances } = require("../helper/balances");
const { request, gql } = require("graphql-request");

async function tvlFromGraph() {
  const graphUrl =
    "https://api.thegraph.com/subgraphs/name/riccardogalbusera/orbit-subgraph";
  const graphQuery = gql`
    query {
      positionManagerFactories(first: 1) {
        protocolTVL
      }
    }
  `;

  const res = await request(graphUrl, graphQuery);
  const tvl = res.positionManagerFactories[0].protocolTVL;
  return toUSDTBalances(tvl);
}

module.exports = {
  polygon: {
    tvl: tvlFromGraph,
  },
};
