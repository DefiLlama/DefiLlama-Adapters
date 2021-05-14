const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/layer3org/spiritswap-analytics'
const graphQuery = gql`
query get_tvl($block: Int) {
  spiritswapFactories(
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;

async function tvl(timestamp, ethBlock, chainBlocks) {
  const {spiritswapFactories} = await request(
    graphUrl,
    graphQuery,
    {
      block:chainBlocks['fantom'],
    }
  );
  const usdTvl = Number(spiritswapFactories[0].totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

module.exports = {
  fantom:{
    tvl,
  },
  tvl
}