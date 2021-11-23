const retry = require("../helper/retry");
const { GraphQLClient, gql } = require("graphql-request");

var graphql_url = "https://graphql.loop.markets/graphql?PairContractsQuery";

var graphQLClient = new GraphQLClient(graphql_url);

async function fetch() {
  var query1 = gql`
    {
      AssetPositions {
        token {
          token
        }
        second_token {
          token
        }
      }
    }
  `;

  let tvl = 0;
  const token0_token1 = (
    await retry(async (bail) => await graphQLClient.request(query1))
  ).AssetPositions;

  for (const token of token0_token1) {
    let query2 = gql`
    {
        tokenTotalLockedValue(
            token: "${token.token.token}",
            second_token: "${token.second_token.token}"
        ){
            liquidity
        }
    }
    `;

    const data = (await retry(
      async (bail) => await graphQLClient.request(query2)
    ));

    tvl += parseFloat(data.tokenTotalLockedValue.liquidity)/10**6;
  }

  return tvl;
}

module.exports = {
  fetch,
};
