const sdk = require("@defillama/sdk");
const { GraphQLClient, gql } = require("graphql-request");

function getChainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};

    var api = `https://api.thegraph.com/subgraphs/name/marginswap/marginswap-v2-${
      chain === "avax" ? "avalanche" : chain
    }`;

    var graphQLClient = new GraphQLClient(api);

    var query = gql`
      {
        aggregatedBalances {
          balance
          token
        }
      }
    `;

    const data = (
      await graphQLClient.request(query)
    ).aggregatedBalances;

    data.forEach((data) => {
      sdk.util.sumSingleBalance(
        balances,
        `${chain}:${data.token}`,
        data.balance
      );
    });
    
    return balances;
  };
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: getChainTvl("ethereum"),
  },
  bsc: {
    tvl: getChainTvl("bsc"),
  },
  avax: {
    tvl: getChainTvl("avax"),
  },
  polygon: {
    tvl: getChainTvl("polygon"),
  },
  methodology:
    "Counts liquidity of deposits, pulling data from Analytics Subgraphs",
};
