const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/mochiswapdev/mochiswap3'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0xCBac17919f7aad11E623Af4FeA98B10B84802eAc",
    block: { number: $block }
  ) {
    totalLiquidityUSD
  },
}
`;

async function tvl(timestamp) {
  const {block} = await sdk.api.util.lookupBlock(timestamp,{
    chain: 'bsc'
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
  bsc:{
    tvl,
  },
  tvl
}
