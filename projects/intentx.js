const ADDRESSES = require('./helper/coreAssets.json')
const { request, gql } = require("graphql-request");

const BETA_START = 1700006400; // 2023-11-15T00:00:00+00:00

const query = gql`
  query stats($from: String!, $to: String!) {
    dailyHistories(
      where: {
        timestamp_gte: $from
        timestamp_lte: $to
        accountSource: "0x8Ab178C07184ffD44F0ADfF4eA2ce6cFc33F3b86"
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
`;

const config = {
  blast: { token: ADDRESSES.blast.USDB, graphUrl: "https://api.studio.thegraph.com/query/62472/intentx-analytics_082_blast/version/latest", },
  base: { token: ADDRESSES.base.USDbC, graphUrl: "https://api.studio.thegraph.com/query/62472/intentx-analytics_082/version/latest", },
}

async function getTVL(api) {
  const { token, graphUrl } = config[api.chain];
  const { dailyHistories } = await request(graphUrl, query, {
    from: BETA_START.toString(),
    to: api.timestamp.toString(),
  });

  const total = dailyHistories.reduce((acc, cur) => acc + (Number(cur.deposit) - Number(cur.withdraw)), 0);
  api.add(token, total)
}

module.exports = {
  timetravel: false,
  start: BETA_START,
};


module.exports = {
  timetravel: false,
  start: BETA_START,
  // blast: { tvl: getTVL },
  base: { tvl: getTVL },
  hallmarks: [[1700006400, "Open Beta Start"], [1704200400, "0.8.2 Migration"]],
};
