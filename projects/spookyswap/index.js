const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/eerieeight/spookyswap'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3",
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
      block:chainBlocks['fantom'],
    }
  );
  const usdTvl = Number(uniswapFactory.totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

module.exports = {
  fantom:{
    tvl,
  },
  tvl
}