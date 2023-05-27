const { GraphQLClient, gql } = require("graphql-request");

var endpoint = "https://api.defiedge.io/graphql";

function tvl(network) {
  return async (_timestamp, _block, _chainBlocks) => {
    var graphQLClient = new GraphQLClient(endpoint);

    var query = gql`
      query Stats($network: [Network!]) {
        stats(network: $network) {
          totalValueManaged
        }
      }
    `;

    var results = await graphQLClient.request(query, { network: [network] });

    return { "usd-coin": results.stats.totalValueManaged };
  };
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  misrepresentedTokens: true,
  ethereum: { tvl: tvl("mainnet") },
  polygon: { tvl: tvl("polygon") },
  arbitrum: { tvl: tvl("arbitrum") },
  optimism: { tvl: tvl("optimism") },
  bsc: {tvl: tvl("bsc")}
};
