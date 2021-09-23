const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/ss-sonic/dfyn-v4'
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
      block: chainBlocks['polygon'] - 60,
    }
  );
  console.log(uniswapFactories)
  const usdTvl = Number(uniswapFactories[0].totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

module.exports = {
  misrepresentedTokens: true,
  polygon:{
    tvl,
  },
  tvl
}