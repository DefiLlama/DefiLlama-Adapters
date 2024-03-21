const { request, gql } = require('graphql-request');
const { toUSDTBalances } = require('../helper/balances');


const graphUrl = 'https://api.sonic.ooo/graphql';
const graphQuery = gql`
query get_tvl($timestamp: Int!) {
   sonicDayData(dateTo: $timestamp, dateFrom: 0) {
      totalLiquidityUSD
        }
}
`;

async function tvl({timestamp}, block) {
   const { sonicDayData } = await request(graphUrl, graphQuery, {
      timestamp,
   });
   const usdTvl = Number(sonicDayData[sonicDayData.length-1].totalLiquidityUSD);

   return toUSDTBalances(usdTvl);
}

module.exports = {
   icp: {
      tvl,
   },
};
