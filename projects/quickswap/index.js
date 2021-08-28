const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/sameepsi/quickswap06'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;

async function tvl(timestamp, block, chainBlocks) {
  const {uniswapFactory} = await request(
    graphUrl,
    graphQuery,
    {
      block: chainBlocks['polygon'],
    }
  );
  const usdTvl = Number(uniswapFactory.totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

module.exports = {
  misrepresentedTokens: true,
  polygon:{
    tvl,
  },
  tvl
}