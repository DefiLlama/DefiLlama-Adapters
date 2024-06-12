const ADDRESSES = require('./helper/coreAssets.json')
const { request, } = require("graphql-request");


const config = {
  blast: { token: ADDRESSES.blast.USDB, start: 1710115200, graphUrl: "https://api.studio.thegraph.com/query/62472/intentx-analytics_082_blast/version/latest", accountSource: '0x083267D20Dbe6C2b0A83Bd0E601dC2299eD99015'},
  base: { token: ADDRESSES.base.USDbC, start: 1700006400, graphUrl: "https://api.studio.thegraph.com/query/62472/intentx-analytics_082/version/latest", accountSource: '0x8Ab178C07184ffD44F0ADfF4eA2ce6cFc33F3b86'},
  mantle: { token: ADDRESSES.mantle.USDC, start: 1712966400, graphUrl: "https://subgraph-api.mantle.xyz/subgraphs/name/mantle_intentx-analytics_082", accountSource: '0xECbd0788bB5a72f9dFDAc1FFeAAF9B7c2B26E456' },
}

async function tvl(api) {
  const { token, graphUrl, start, accountSource } = config[api.chain]

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
  if (api.chain === 'mantle') total /= 1e12
  api.add(token, total)
}

module.exports = {
  start: config.base.start,
  hallmarks: [
    [config.base.start, "Open Beta Start"],
    [1704200400, "0.8.2 Migration"],
    [config.blast.start, "Blast Deploy"],
    [config.mantle.start, "Mantle Deploy"],
  ],
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})