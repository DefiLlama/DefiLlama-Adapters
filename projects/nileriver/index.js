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
  const data_pools = (
    await retry(async (bail) => await graphQLClient.request(query))
  ).pools
    .map((liq) => Number(liq.totalLiquidity))
    .forEach(function (sum) {
      tvlPools += sum;
    });

  /*** Farms TVL Portion ***/
  let tvlFarms = 0;
  const data_farms = (await utils.fetchURL(endpoint_farms)).data.data
    .map((t) => t.tvl)
    .forEach(function (sum) {
      tvlFarms += sum;
    });

  return tvlPools + tvlFarms;
}

module.exports = {
  fetch,
};
