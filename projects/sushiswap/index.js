const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;

async function tvl(timestamp, block) {
  const {uniswapFactory} = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );
  const usdTvl = Number(uniswapFactory.totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

module.exports = {
  ethereum:{
    tvl,
  },
  tvl
}