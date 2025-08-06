const { request } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");

const GRAPH_URL = "https://graph.daoaas.io/subgraphs/name/uniswap-v2-eni-mainnet";

const GRAPH_QUERY = `
query uniswapDayDatas($startTime: Int!, $skip: Int!) {
  uniswapDayDatas(
    first: 1000,
    skip: $skip,
    where: {date_gt: $startTime},
    orderBy: date,
    orderDirection: desc
  ) {
    id
    date
    totalVolumeUSD
    dailyVolumeUSD
    dailyVolumeETH
    totalLiquidityUSD
    totalLiquidityETH
    __typename
  }
}`;

async function eniTvl(timestamp, ethBlock, chainBlocks) {
  const { uniswapDayDatas } = await request(GRAPH_URL, GRAPH_QUERY, { 
    startTime: 1748675722,
    skip: 0,
  });
  const usdTvl = Number(uniswapDayDatas[0].totalLiquidityUSD);

  return toUSDTBalances(usdTvl);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: "Pool liquidity on DAOaas Swap. Data is getting from the 'uniswap-v2-eni-mainnet' subgraph.",
  eni: {
    tvl: eniTvl
  }
};