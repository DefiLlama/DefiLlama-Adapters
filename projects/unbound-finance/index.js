const retry = require("async-retry");
const BigNumber = require("bignumber.js");
const { GraphQLClient, gql } = require("graphql-request");

async function fetch() {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/unbound-finance/unbound";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    {
      protocols {
        tvl
      }
    }
  `;
  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );
  return new BigNumber(results.protocols[0].tvl).div(10 ** 18).toFixed(2);
}

module.exports = {
  fetch,
};
