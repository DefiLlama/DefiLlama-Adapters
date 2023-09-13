const { getUniTVL } = require('../helper/unknownTokens')
const { request } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");

const graphUrl = "https://graph.pegorpc.com/subgraphs/name/satoshirock/w3infov2";
const graphQuery = `
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
}
`;

async function pegoTvl(timestamp, ethBlock, chainBlocks) {
  const { uniswapDayDatas } = await request(graphUrl, graphQuery, {
    startTime: 1663027198,
    skip: 0,
  });
  const usdTvl = Number(uniswapDayDatas[0].totalLiquidityUSD);

  return toUSDTBalances(usdTvl);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: "Counts the tokens locked on AMM pools. Data is getting from the 'satoshirock/w3infov2' subgraph.",
  pego: {
    tvl: pegoTvl
  },
  bsc: {
    tvl: getUniTVL({
      factory: '0xD04A80baeeF12fD7b1D1ee6b1f8ad354f81bc4d7', 
      useDefaultCoreAssets: true
    })
  },
};