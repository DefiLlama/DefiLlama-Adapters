const ADDRESSES = require('../helper/coreAssets.json')
const { request, } = require("graphql-request");

const freestyleConfig = {
  base: {
      token: ADDRESSES.base.USDC,
      start: 1700006400,
      graphUrl: "https://api.studio.thegraph.com/query/62454/analytics_base_8_2/version/latest",
      accountSource: '0x6D63921D8203044f6AbaD8F346d3AEa9A2719dDD'
  },
}

async function tvl(api) {
  const { token, graphUrl, start, accountSource } = freestyleConfig[api.chain]

  const query = `
      query stats($from: String!, $to: String!) {
          dailyHistories(
          where: {
              timestamp_gte: $from
              timestamp_lte: $to
              accountSource: "${accountSource}"
          }
          ) {
          timestamp
          platformFee
          accountSource
          tradeVolume
          deposit
          withdraw
          }
      }
  `
  const { dailyHistories } = await request(graphUrl, query, {
      from: start.toString(),
      to: api.timestamp.toString(),
  });

  let total = dailyHistories.reduce((acc, cur) => acc + (Number(cur.deposit) - Number(cur.withdraw)), 0);
  
  api.add(token, total)
}

Object.keys(freestyleConfig).forEach(chain => {
  module.exports[chain] = { tvl }
})