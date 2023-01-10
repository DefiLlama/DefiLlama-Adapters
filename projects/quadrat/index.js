const { GraphQLClient, gql } = require('graphql-request')
const sdk = require('@defillama/sdk')

const CHAINS = ['polygon', 'optimism', 'ethereum', 'arbitrum'];

const GRAPH_CLIENTS = {
  polygon: new GraphQLClient('https://api.thegraph.com/subgraphs/name/krivochenko/plasma-quadrat-matic'),
  optimism: new GraphQLClient('https://api.thegraph.com/subgraphs/name/krivochenko/plasma-quadrat-optimism'),
  ethereum: new GraphQLClient('https://api.thegraph.com/subgraphs/name/krivochenko/plasma-quadrat-mainnet'),
  arbitrum: new GraphQLClient('https://api.thegraph.com/subgraphs/name/krivochenko/plasma-quadrat-arbitrum'),
};

const GRAPH_QUERY = gql`
    query strategies ($timestamp: Int! $skip: Int! $first: Int!) {
        strategies (skip:$skip first:$first) {
            token0 {
                id
            }
            token1 {
                id
            }
            daysData (orderBy: createdAt orderDirection: desc skip:0 first: 2,where: {createdAt_lte:$timestamp}) {
                amount0
                amount1
            }
        }
    }
`;

function chainTvlFactory(chain) {
  return async (timestamp) => {
    const graphQLClient = GRAPH_CLIENTS[chain];
    const result = await graphQLClient.request(GRAPH_QUERY, { timestamp, skip: 0, first: 1000 });
    if (!Array.isArray(result.strategies)) {
      return {}
    }

    const balances = {}
    result.strategies.forEach(strategy => {
      const dayData = strategy.daysData[0];
      if (dayData)  {
        sdk.util.sumSingleBalance(balances, strategy.token0.id, dayData.amount0);
        sdk.util.sumSingleBalance(balances, strategy.token1.id, dayData.amount1);
      }
    });
    return balances
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Counts the tokens locked in Strategy Vaults in Uniswap v3 Pools.',
  start: 1667197843, // Mon Oct 31 2022 06:30:43 GMT+0000
  ...CHAINS.reduce((tvls, chain) => {
    tvls[chain] = {
      tvl: chainTvlFactory(chain),
    };
    return tvls;
  }, {}),
}
