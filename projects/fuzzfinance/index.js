const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://graph.fuzz.fi/subgraphs/name/fuzzfinance/fuzzswap'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0x5245d2136dc79Df222f00695C0c29d0c4d0E98A6",
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
  methodology: `Counts the tokens locked on AMM pools, pulling the data from their subgraph "https://graph.fuzz.fi/subgraphs/name/fuzzfinance/fuzzswap".`,
  harmony:{
    tvl,
  },
  tvl
}
