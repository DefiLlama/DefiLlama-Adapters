const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');
const graphUrl = 'https://api.thegraph.com/subgraphs/name/lydiacoder/lydia'

const graphQuery = gql`
query get_tvl($block: Int) {
  pangolinFactory(
    id: "0xe0C1bb6DF4851feEEdc3E14Bd509FEAF428f7655",
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
  start: 0,
  tvl
}
