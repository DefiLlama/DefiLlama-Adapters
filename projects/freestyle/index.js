const ADDRESSES = require('../helper/coreAssets.json')
const { request, } = require("graphql-request");

const freestyleConfig = {
  base: {
      token: ADDRESSES.base.USDC,
      start: '2023-11-15',
      graphUrl: "https://api-v2.morphex.trade/subgraph/3KhmYXgsM3CM1bbUCX8ejhcxQCtWwpUGhP7p9aDKZ94Z",
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