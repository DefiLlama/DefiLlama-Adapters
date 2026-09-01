const ADDRESSES = require('../helper/coreAssets.json')
const { request, } = require("graphql-request");

// the bmx_analytics_* goldsky subgraphs were deleted, we now use the official SYMMIO analytics
// subgraphs filtered by the freestyle accountSource. There is no SYMMIO analytics subgraph for
// mode anymore, so that chain is skipped.
const freestyleConfig = {
  base: {
      token: ADDRESSES.base.USDC,
      start: 1700006400,
      graphUrl: "https://api.goldsky.com/api/public/project_cm1hfr4527p0f01u85mz499u8/subgraphs/base_analytics/latest/gn",
      accountSource: '0x6D63921D8203044f6AbaD8F346d3AEa9A2719dDD'
  },
  mode: {
      token: ADDRESSES.mode.USDC,
      start: 1700006400,
      graphUrl: null,
      accountSource: '0xC0ff4B56f62f20bA45f4229CC6BAaD986FA2a904'
  }
}

async function tvl(api) {
  const { token, graphUrl, start, accountSource } = freestyleConfig[api.chain]
  if (!graphUrl) return;

  const query = `
      query stats($from: String!, $to: String!) {
          dailyHistories(
          first: 1000
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