const ADDRESSES = require('./helper/coreAssets.json')
const { request } = require("graphql-request");

const config = {
  blast: { token: ADDRESSES.blast.USDB, start: 1710115200, graphUrl: "https://api.goldsky.com/api/public/project_cm0bho0j0ji6001t8e26s0wv8/subgraphs/intentx-blast-analytics-083/latest/gn", accountSource: '0x083267D20Dbe6C2b0A83Bd0E601dC2299eD99015'},
  base: { token: ADDRESSES.base.USDbC, start: 1700006400, graphUrl: "https://api.goldsky.com/api/public/project_cm0bho0j0ji6001t8e26s0wv8/subgraphs/intentx-base-analytics-083/latest/gn", accountSource: '0x8Ab178C07184ffD44F0ADfF4eA2ce6cFc33F3b86'},
  mantle: { token: ADDRESSES.mantle.USDC, start: 1712966400, graphUrl: "https://api.goldsky.com/api/public/project_cm0bho0j0ji6001t8e26s0wv8/subgraphs/intentx-mantle-analytics-083/latest/gn", accountSource: '0xECbd0788bB5a72f9dFDAc1FFeAAF9B7c2B26E456' },
  arbitrum: { token: ADDRESSES.arbitrum.USDC, start: 1712966400, graphUrl: "https://api.goldsky.com/api/public/project_cm0bho0j0ji6001t8e26s0wv8/subgraphs/intentx-arbitrum-analytics-083/latest/gn", accountSource: '0x141269e29a770644c34e05b127ab621511f20109' },
}

async function tvl(api) {
  const { token, graphUrl, start, accountSource } = config[api.chain]
  const from = start.toString()
  const to = api.timestamp.toString()

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
  const { dailyHistories } = await request(graphUrl, query, { from, to })
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
    [1725753600, "0.8.3 Migration"]
  ],
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: chain === 'blast' ? () => ({}) : tvl
  }
})
