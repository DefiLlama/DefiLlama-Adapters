const { GraphQLClient, gql } = require('graphql-request')
const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js');

module.exports = {
  doublecounted: true,
  methodology: 'Counts the tokens locked in Strategy Vaults in Uniswap v3 Pools.',
  start: 1667197843, // Mon Oct 31 2022 06:30:43 GMT+0000
};

const GRAPH_CLIENTS = {
  ethereum: new GraphQLClient('https://api.thegraph.com/subgraphs/name/ilyamk/quadrat-v1-ethereum'),
  polygon: new GraphQLClient('https://api.thegraph.com/subgraphs/name/ilyamk/quadrat-v1-polygon'),
  arbitrum: new GraphQLClient('https://api.thegraph.com/subgraphs/name/ilyamk/quadrat-v1-arbitrum'),
  optimism: new GraphQLClient('https://api.thegraph.com/subgraphs/name/ilyamk/quadrat-v1-optimism'),
  bsc: new GraphQLClient('https://api.thegraph.com/subgraphs/name/ilyamk/quadrat-v1-bnb'),
};

const GRAPH_QUERY = gql`
  query Strategies ($skip: Int! $first: Int! $timestamp: BigInt!) {
    strategies (skip: $skip first: $first) {
      meta {
        token0 { id decimals }
        token1 { id decimals }
      }
      history (orderBy: timestamp orderDirection: desc skip: 0 first: 1 where: { timestamp_lte: $timestamp timeframe: ONE_DAY }) {
        tvlToken0
        tvlToken1
      }
    }
  }
`;

function strategiesTvl(chain) {
  return async (timestamp, _, _1, { api }) => {
    const client = GRAPH_CLIENTS[chain];
    const startDayTimestamp = Math.floor(timestamp / 86400) * 86400;
    const { strategies } = await client.request(GRAPH_QUERY, { skip: 0, first: 1, timestamp: startDayTimestamp });

    if (!Array.isArray(strategies)) {
      return {}
    }

    const balances = {}

    strategies.forEach(strategy => {
      const dayData = strategy.history[0];
      if (dayData)  {
        const { token0, token1 } = strategy.meta
        const tvlToken0 = new BigNumber(dayData.tvlToken0).times(new BigNumber(10).pow(token0.decimals)).toFixed(0, 1)
        const tvlToken1 = new BigNumber(dayData.tvlToken1).times(new BigNumber(10).pow(token1.decimals)).toFixed(0, 1)

        sdk.util.sumSingleBalance(balances, token0.id, tvlToken0, api.chain);
        sdk.util.sumSingleBalance(balances, token1.id, tvlToken1, api.chain);
      }
    });
    return balances
  };
}

Object.keys(GRAPH_CLIENTS).forEach(chain => {
  module.exports[chain] = {
    tvl: strategiesTvl(chain)
  }
})
