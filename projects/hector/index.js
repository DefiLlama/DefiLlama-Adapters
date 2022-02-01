const { GraphQLClient, gql } = require("graphql-request");
const retry = require("async-retry");

const bank = "0xBB97c2875e640f75297da0147914C8f10d7c5174";
const lpPool = "0x24699312CB27C26Cfc669459D670559E5E44EE60";

async function fetch() {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/hectordao-hec/hector-dao";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    query {
      protocolMetrics(first: 1, orderBy: timestamp, orderDirection: desc) {
        treasuryMarketValue
      }
    }
  `;
  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );
  return results.protocolMetrics[0].treasuryMarketValue;
}

module.exports = {
  fetch,
};
