const retry = require("async-retry");
const { GraphQLClient, gql } = require("graphql-request");

const USDH_TOKEN_ADDRESS = "0x92B27abe3C96d3B1266f881b3B0886e68645F51F";
const MATIC_ADDRESS = "0x0000000000000000000000000000000000000000";

async function fetch() {
  var endpoint = "https://api.thegraph.com/subgraphs/name/defihalal/defi-halal";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    {
      globals(first: 1) {
        currentSystemState {
          totalCollateral
          tokensInStabilityPool
        }
      }
    }
  `;
  const results = await retry(async (bail) => await graphQLClient.request(query));
  let stabilityPoolUsdhTvl = parseFloat(results.globals[0].currentSystemState.tokensInStabilityPool);
  let troveMaticTvl = parseFloat(results.globals[0].currentSystemState.totalCollateral);

  return {
    [MATIC_ADDRESS]: troveMaticTvl,
    [USDH_TOKEN_ADDRESS]: stabilityPoolUsdhTvl,
  };
}

module.exports = {
  name: "DeFiHalal",
  token: "USDH",
  category: "minting",
  start: 1633123998,
  fetch,
};
