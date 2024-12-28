const sdk = require("@defillama/sdk");
const { toUSDTBalances } = require("../helper/balances");
const { request, gql } = require("graphql-request");

async function tvlFromGraph() {
  const graphUrl =
    sdk.graph.modifyEndpoint('BRUJ3Y4Fpq4VuvoCAi4p9qv1SxZ6ghVtMK1Rg8igfxmi');
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
