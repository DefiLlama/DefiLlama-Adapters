const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');
const graphUrl = 'https://api.thegraph.com/subgraphs/name/dasconnor/pangolin-dex'

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

  return toUSDTBalances(usdTvl)
}

module.exports = {
  avalanche:{
    tvl,
  },
  start: 1612715300, // 7th-Feb-2021
  tvl
}