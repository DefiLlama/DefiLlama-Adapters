const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const graphUrl = 'https://thegraph.cndlchain.com/subgraphs/name/ianlapham/uniswap-v3'

const graphQuery = gql`
query MyQuery {
  pools(first: 10) {
    id
    liquidity
  }
}
`;

async function tvl(timestamp, ethBlock, chainBlocks) {
  const response = await request(
    graphUrl,
    graphQuery,
    {
      block:chainBlocks.cndl,
    }
  );

  return toUSDTBalances(Number(response.factory.totalValueLockedUSD));
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'The Carthage subgraph and the Carthage factory contract address are used to obtain the balance held in every LP pair.',
  candle:{
    tvl,
  },
  start: 1612715300, // 7th-Feb-2021
}
