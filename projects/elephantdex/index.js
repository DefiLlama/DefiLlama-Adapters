const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://elephantgraph.com/subgraphs/name/elephantproject/subgraph21'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0x0Dea90EC11032615E027664D2708BC292Bbd976B",
    block: { number: $block }
  ) {
    totalLiquidityUSD
  },
}
`;

async function tvl(timestamp) {
  const {block} = await sdk.api.util.lookupBlock(timestamp,{
    chain: 'harmony'
  })
  const response = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );

  const usdTvl = Number(response.uniswapFactory.totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

module.exports = {
  harmony:{
    tvl,
  },
  tvl
}
