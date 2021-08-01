const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://ftmgraph2.hyperswap.fi/subgraphs/name/ftm-subgraph'
const graphQuery = gql`
query get_tvl($block: Int) {
  hyperswapFactories(
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;

async function tvl(timestamp, block, chainBlocks) {
  const {hyperswapFactories} = await request(
    graphUrl,
    graphQuery,
    {
      block: chainBlocks['fantom'],
    }
  );
  const usdTvl = Number(hyperswapFactories[0].totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

module.exports = {
  misrepresentedTokens: true,
  fantom:{
    tvl,
  },
  tvl
}