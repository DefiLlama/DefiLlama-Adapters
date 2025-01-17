const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");

const GRAPH_QUERY = gql`
  query get_tvl($dto: GetTotalValueLockedDto!) {
    totalValueLocked(dto: $dto) {
      value
    }
  }
`;

function getChainTvl(graphUrls) {
  return (chain) => {
    return async (api) => {
      const result = await request(
        graphUrls[chain],
        GRAPH_QUERY,
        {
          dto: {
            chainId: "tDVV",
            timestamp: api.timestamp * 1000,
          },
        },
        {
          Accept: "*/*, application/json",
        }
      );

      return toUSDTBalances(result.totalValueLocked.value);
    };
  };
}

const v2graph = getChainTvl({
  aelf: "https://app.aefinder.io/awaken/995f8e7e957d43d6b1706a4e351e2e47/graphql",
});

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from the 'AElfIndexer_Swap' subgraph`,
  start: '2024-02-01',
  aelf: {
    tvl: v2graph("aelf"),
  },
};
