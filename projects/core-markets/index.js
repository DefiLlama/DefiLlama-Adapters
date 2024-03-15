const { request, gql } = require("graphql-request");

const graphUrl =
  "https://api.studio.thegraph.com/query/62472/core-analytics-082/version/latest";

const BETA_START = "236678";

const query = gql`
  query stats($from: String!, $to: String!) {
    dailyHistories(
      where: {
        timestamp_gte: $from
        timestamp_lte: $to
        accountSource: "0xd6ee1fd75d11989e57B57AA6Fd75f558fBf02a5e"
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
    "base:0x4300000000000000000000000000000000000003": total,
  };
}

module.exports = {
  timetravel: false,
  start: 236678,
  base: {
    tvl: async (timestamp) => {
      return getTVL(timestamp);
    },
  },
};
