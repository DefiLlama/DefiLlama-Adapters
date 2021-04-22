const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/1hive/honeyswap-v2'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0xa818b4f111ccac7aa31d0bcc0806d64f2e0737d7",
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;

async function tvl(timestamp) {
  const { block } = await sdk.api.util.lookupBlock(timestamp, {
    chain: 'xdai'
  })
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
  xdai: {
    tvl,
  },
  tvl
}