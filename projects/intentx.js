const ADDRESSES = require('./helper/coreAssets.json')
const { request, gql } = require("graphql-request");

const graphUrl =
  "https://api.thegraph.com/subgraphs/name/intent-x/perpetuals-analytics_base";

const BETA_START = 1700006400; // 2023-11-15T00:00:00+00:00

const query = gql`
  query stats($from: String!, $to: String!) {
    dailyHistories(
      where: {
        timestamp_gte: $from
        timestamp_lte: $to
        accountSource: "0x724796d2e9143920B1b58651B04e1Ed201b8cC98"
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

async function getTVL(toTimestamp) {
  const { dailyHistories } = await request(graphUrl, query, {
    from: BETA_START.toString(),
    to: toTimestamp.toString(),
  });

  const total = dailyHistories.reduce(
    (acc, cur) => acc + (Number(cur.deposit) - Number(cur.withdraw)),
    0
  );

  return {
    ["base:" + ADDRESSES.base.USDbC]: total,
  };
}

module.exports = {
  timetravel: false,
  start: BETA_START,
  base: {
    tvl: async (timestamp) => {
      return getTVL(timestamp);
    },
  },
  hallmarks: [[1700006400, "Open Beta Start"]],
};
