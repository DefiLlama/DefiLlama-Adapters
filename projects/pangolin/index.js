const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk')
const graphUrl = 'https://api.thegraph.com/subgraphs/name/dasconnor/pangolin-dex'

const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const graphQuery = gql`
query get_tvl($block: Int) {
  pangolinFactory(
    id: "0xefa94DE7a4656D787667C749f7E1223D71E9FD88",
    block: { number: $block }
  ) {
        totalLiquidityETH
        totalLiquidityUSD
  },
  tokens(where: { symbol: "USDT" }, first:1) {
    derivedETH
  }
}
`;

async function tvl(timestamp) {
  const {block} = await sdk.api.util.lookupBlock(timestamp,{
    chain: 'avax'
  })
  const response = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );

  const usdTvl = Number(response.pangolinFactory.totalLiquidityETH) / Number(response.tokens[0].derivedETH)

  return {
    [usdtAddress]: (usdTvl * 1e6).toFixed(0)
  }
}

module.exports = {
  avalanche:{
    tvl,
  },
  start: 1612715300, // 7th-Feb-2021
  tvl
}