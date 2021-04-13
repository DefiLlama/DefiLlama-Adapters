const { request, gql } = require("graphql-request");

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
const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'

async function tvl(timestamp, block) {
  const {uniswapFactory} = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );
  const usdTvl = Number(uniswapFactory.totalLiquidityUSD)

  return {
    [usdtAddress]: (usdTvl * 1e6).toFixed(0)
  }
}

module.exports = {
  ethereum:{
    tvl,
  },
  tvl
}