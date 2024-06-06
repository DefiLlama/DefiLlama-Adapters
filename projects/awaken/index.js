const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");

const GRAPH_QUERY = gql`
  query get_tvl($dto: GetTotalValueLockedDto) {
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
  aelf: "https://dapp.awaken.finance/AElfIndexer_Swap/SwapIndexerSchema/graphql",
});

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from the 'AElfIndexer_Swap' subgraph`,
  start: 1706745600,
  aelf: {
    tvl: v2graph("aelf"),
  },
};
