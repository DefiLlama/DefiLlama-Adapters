const { request, gql } = require('graphql-request');
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.sonic.ooo/graphQl'
const graphUrl_v3 = 'https://v3.api.sonic.ooo'

const graphQuery = gql`
query get_tvl($timestamp: Int!) {
   sonicDayData(dateTo: $timestamp, dateFrom: 0) {
      totalLiquidityUSD
   }
}
`;

const tvl = async ({ timestamp }) => {
   const [{ sonicDayData: data_v1 }, { sonicDayData: data_v3 }] = await Promise.all([
      request(graphUrl, graphQuery, { timestamp }),
      request(graphUrl_v3, graphQuery, { timestamp })
   ])

   const supply_v1 = Number(data_v1[data_v1.length-1].totalLiquidityUSD) || 0 // api return orderBy DESC
   const supply_v3 = Number(data_v3[0].totalLiquidityUSD) || 0                // api return orderBy ASC
   return toUSDTBalances(supply_v1+supply_v3);
}

module.exports = {
   icp: { tvl }
}