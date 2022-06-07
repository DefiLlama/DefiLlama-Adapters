const { request, gql, rawRequest } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');
const { getBlock } = require("../helper/getBlock");

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
async function tvl(timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, "harmony", chainBlocks)
  const response = await request(
    graphUrl,
    graphQuery,
    {
      block: block - 100,
    }
  );
  const usdTvl = Number(response.uniswapFactory.totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}
module.exports = {
  harmony:{
    tvl,
  },
}
