const { request, gql } = require("graphql-request");
const sdk = require("@defillama/sdk");
const { toUSDTBalances } = require("../helper/balances");

const graphUrl =
  "https://graph.defikingdoms.com/subgraphs/name/defikingdoms/dex";
const graphQuery = gql`
  query get_tvl($block: Int) {
    uniswapFactory(
      id: "0x9014B937069918bd319f80e8B3BB4A2cf6FAA5F7"
      block: { number: $block }
    ) {
      totalLiquidityUSD
    }
  }
`;

async function tvl(timestamp) {
  const { block } = await sdk.api.util.lookupBlock(timestamp, {
    chain: "harmony",
  });
  const response = await request(graphUrl, graphQuery, {
    block,
  });

  const usdTvl = Number(response.uniswapFactory.totalLiquidityUSD);

  return toUSDTBalances(usdTvl);
}

module.exports = {
  harmony: {
    tvl,
  },
  tvl,
};
