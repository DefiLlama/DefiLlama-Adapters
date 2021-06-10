const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2'
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

async function tvl(timestamp, block) {
  const {uniswapFactories} = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );
  const usdTvl = Number(uniswapFactories[0].totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

module.exports = {
  ethereum:{
    tvl,
  },
  tvl
}