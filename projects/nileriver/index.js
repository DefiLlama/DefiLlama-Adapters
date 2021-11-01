const retry = require("../helper/retry");
const utils = require("../helper/utils");
const { GraphQLClient, gql } = require("graphql-request");

const endpoint_farms = "https://api.nileriver.finance/public/farm";
var endpoint_pools =
  "https://subgraph.nileriver.finance/subgraphs/name/moonriver/swap";

var graphQLClient = new GraphQLClient(endpoint_pools);

async function fetch() {
  var query = gql`
    {
      pools {
        totalLiquidity
      }
    }
  `;

  /*** Pools TVL Portion ***/
  let tvlPools = 0;
  (await retry(async (bail) => await graphQLClient.request(query)))
    .pools
    .forEach(function (liq) {
      tvlPools += Number(liq.totalLiquidity);
    });
  
  return tvlPools;
}

module.exports = {
  fetch,
};
