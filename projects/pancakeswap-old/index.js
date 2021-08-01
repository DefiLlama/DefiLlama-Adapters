const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactories(
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;

async function tvl(timestamp, block, chainBlocks) {
  const {uniswapFactories} = await request(
    graphUrl,
    graphQuery,
    {
      block: chainBlocks['bsc'],
    }
  );
  const usdTvl = Number(uniswapFactories[0].totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

module.exports = {
  misrepresentedTokens: true,
  bsc:{
    tvl,
  },
  tvl
}