const { request, gql, rawRequest } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.openswap.one/subgraphs/name/openswap/openswapv2'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0x5d2f9817303b940c9bb4f47c8c566c5c034d9848",
    block: { number: $block }
  ) {
    totalLiquidityUSD
  },
}
`;
const openxLiquidity = gql`
  query get_tvl($block: Int) {
    token(id: "0x01a4b054110d57069c1658afbc46730529a3e326") {
      symbol
      tokenDayData(orderDirection: desc) {
        totalLiquidityUSD
      }
    }
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
async function openxTvl(timestamp) {
  const { block } = await sdk.api.util.lookupBlock(timestamp, {
    chain: "harmony",
  });
  const response = await request(graphUrl, openxLiquidity, {
    block,
  });

  const openxTvl = Number(
    response.token.tokenDayData.slice(-1)[0].totalLiquidityUSD
  );
  return toUSDTBalances(openxTvl);
}
module.exports = {
  harmony:{
    tvl,
    staking: openxTvl,
  },
  tvl
}
