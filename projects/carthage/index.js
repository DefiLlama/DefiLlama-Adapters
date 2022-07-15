const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const graphUrl = 'https://thegraph.cndlchain.com/subgraphs/name/ianlapham/uniswap-v3'

const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0x5Bb7BAE25728e9e51c25466D2A15FaE97834FD95",
    block: { number: $block }
  ) {
    totalLiquidityUSD
  }
}
`;

async function tvl(timestamp, ethBlock, chainBlocks) {
  const response = await request(
    graphUrl,
    graphQuery,
    {
      block:chainBlocks.avax,
    }
  );

  return toUSDTBalances(Number(response.uniswapFactory.totalLiquidityUSD));
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'The Carthage subgraph and the Carthage factory contract address are used to obtain the balance held in every LP pair.',
  candle:{
    tvl,
  },
  start: 1612715300, // 7th-Feb-2021
}
