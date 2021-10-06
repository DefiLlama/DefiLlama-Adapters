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
const jewelLiquidity = gql`
  query get_tvl($block: Int) {
    token(id: "0x72cb10c6bfa5624dd07ef608027e366bd690048f") {
      symbol
      tokenDayData(orderDirection: desc) {
        totalLiquidityUSD
      }
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

async function stakingTvl(timestamp) {
  const { block } = await sdk.api.util.lookupBlock(timestamp, {
    chain: "harmony",
  });
  const response = await request(graphUrl, jewelLiquidity, {
    block,
  });

  const usdTvl = Number(
    response.token.tokenDayData.slice(-1)[0].totalLiquidityUSD
  );

  return toUSDTBalances(usdTvl);
}

module.exports = {
  harmony: {
    tvl,
    staking: stakingTvl,
  },
  tvl,
};
