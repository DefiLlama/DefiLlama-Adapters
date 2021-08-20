const { request, gql } = require("graphql-request");

const graphUrl = 'https://api.thegraph.com/subgraphs/name/baguette-exchange/baguette'

const graphQuery = gql`
query get_tvl($block: Int) {
  baguetteFactories(
    block: { number: $block }
  ) {
        totalLiquidityETH
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

  return {
    'avalanche-2': Number(response.baguetteFactories[0].totalLiquidityETH)
  }
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'We count liquidity on the pairs. We get that information from the "baguette-exchange/baguette" subgraph',
  avalanche:{
    tvl,
  },
  tvl
}