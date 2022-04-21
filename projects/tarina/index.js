const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const graphUrl = 'https://api.thegraph.com/subgraphs/name/tarinaexchange/tarinav4'

const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0xb334a709dd2146caced08e698c05d4d22e2ac046",
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
  methodology: 'The Tarina subgraph and the Tarina factory contract address are used to obtain the balance held in every LP pair.',
  avalanche:{
    tvl,
  },
  start: 1650124800, // 17th-April-2022
}