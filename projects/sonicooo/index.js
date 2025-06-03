const { request, gql } = require('graphql-request');
const { toUSDTBalances } = require('../helper/balances');

const graphUrl_v3 = 'https://v3.api.sonic.ooo'

const graphQuery = gql`
query get_tvl($timestamp: Int!) {
   sonicDayData(dateTo: $timestamp, dateFrom: 0) {
      totalLiquidityUSD
   }
}`

const tvl = async ({ timestamp }) => {
  const { sonicDayData: data_v3 } = await request(graphUrl_v3, graphQuery, { timestamp });
  const now = Math.floor(Date.now() / 1000);
  const dayOffset = Math.floor((now - timestamp) / 86400);
  const targetDay = data_v3[data_v3.length - 1 - dayOffset];
  const supply_v3 = Number(targetDay?.totalLiquidityUSD) || 0;
  return toUSDTBalances(supply_v3);
};

module.exports = {
   icp: { tvl }
}