const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const graphUrl = 'https://thegraph.cndlchain.com/subgraphs/name/ianlapham/uniswap-v3-test'

const graphQuery = gql`
query get_tvl($block: Int, $number_gte: Int = 10) {
  factory(
    id: "0x5Bb7BAE25728e9e51c25466D2A15FaE97834FD95"
    block: {number_gte: $number_gte}
  ) {
    totalValueLockedETHUntracked
    totalValueLockedETH
    totalValueLockedUSD
    totalValueLockedUSDUntracked
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
