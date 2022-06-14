const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const graphUrl = 'https://api.thegraph.com/subgraphs/name/billy93/exchange'

const graphQuery = gql`
query gettvl($block: Int) {
  factory(
    id: "0x9c60c867ce07a3c403e2598388673c10259ec768",
    block: { number: $block }
  ) {
    liquidityUSD
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

  return toUSDTBalances(Number(response.factory.liquidityUSD));
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'Using the Swapsicle factory subgraph and contract address we are able to retrieve the total balance held in all liquidity pairs.',
  avalanche:{
    tvl,
  }
}