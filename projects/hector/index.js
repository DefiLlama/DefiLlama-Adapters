const { GraphQLClient, gql } = require("graphql-request");
const retry = require("async-retry");
const { toUSDTBalances } = require("../helper/balances");
const axios = require("axios");

const staking = async () => {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/hectordao-hec/hector-dao";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    query {
      protocolMetrics(first: 1, orderBy: timestamp, orderDirection: desc) {
        totalValueLocked
      }
    }
  `;
  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );
  return toUSDTBalances(+results.protocolMetrics[0].totalValueLocked);
};

async function tvl() {
  var endpoint = "https://beta.hector.finance/api/debank";
  let { treasuryVal } = await retry(
    async (bail) => await axios.get(endpoint)
  ).then((res) => res.data);

  return toUSDTBalances(treasuryVal);
}
async function borrowedTvl() {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/hectordao-hec/hector-dao";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    query {
      protocolMetrics(first: 1, orderBy: timestamp, orderDirection: desc) {
        bankBorrowed
      }
    }
  `;
  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );

  return toUSDTBalances(results.protocolMetrics[0].bankBorrowed);
}
// node test.js projects/hector/index.js
module.exports = {
  misrepresentedTokens: true,
  fantom: {
    tvl: tvl,
    staking: staking,
    borrowed: borrowedTvl,
  },
};
