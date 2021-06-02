const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');

// BSC Graph
const graphUrl = 'https://api.thegraph.com/subgraphs/name/mochiswapdev/mochiswap3'
// Harmony ONE Graph
const graphUrlHarmony = 'https://api.mochiswap.io/subgraphs/name/mochiswap/mochiswap1'

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

const graphQueryHarmony = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0x3bEF610a4A6736Fd00EBf9A73DA5535B413d82F6",
    block: { number: $block }
  ) {
    totalLiquidityUSD
  },
}
`;

async function tvl(timestamp) {
  // BSC lookup
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
  // Harmony ONE lookup
  const {block} = await sdk.api.util.lookupBlock(timestamp,{
    chain: 'harmony'
  })
  const responseHarmony = await request(
    graphUrlHarmony,
    graphQueryHarmony,
    {
      block,
    }
  );

  const usdTvl = Number(response.uniswapFactory.totalLiquidityUSD) + Number(responseHarmony.uniswapFactory.totalLiquidityUSD)

  // Return Total MochiSwap Cross Chain Liquidity
  return toUSDTBalances(usdTvl)
}

module.exports = {
  bsc:{
    tvl,
  },
  tvl
}
