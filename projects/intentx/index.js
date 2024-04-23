const ADDRESSES = require("./helper/coreAssets.json");
const { request, gql } = require("graphql-request");

const graphUrl =
  "https://api.studio.thegraph.com/query/62472/intentx-analytics_082/version/latest";
const blastGraphUrl =
  "https://api.studio.thegraph.com/query/62472/intentx-analytics_082_blast/version/latest";
const mantleGraphUrl =
  "https://subgraph-api.mantle.xyz/subgraphs/name/mantle_intentx-analytics_082";

const BETA_START = 1700006400; // 2023-11-15T00:00:00+00:00
const BLAST_DEPLOY = 1710115200; // 2024-03-11T00:00:00+00:00
const MANTLE_DEPLOY = 1712966400; // 2024-03-11T00:00:00+00:00

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
const blastQuery = gql`
  query stats($from: String!, $to: String!) {
    dailyHistories(
      where: {
        timestamp_gte: $from
        timestamp_lte: $to
        accountSource: "0x083267D20Dbe6C2b0A83Bd0E601dC2299eD99015"
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
const mantleQuery = gql`
  query stats($from: String!, $to: String!) {
    dailyHistories(
      where: {
        timestamp_gte: $from
        timestamp_lte: $to
        accountSource: "0xECbd0788bB5a72f9dFDAc1FFeAAF9B7c2B26E456"
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

  const { dailyHistories: blastDailyHistories } = await request(
    blastGraphUrl,
    blastQuery,
    {
      from: BETA_START.toString(),
      to: toTimestamp.toString(),
    }
  );

  const { dailyHistories: mantleDailyHistories } = await request(
    mantleGraphUrl,
    mantleQuery,
    {
      from: BETA_START.toString(),
      to: toTimestamp.toString(),
    }
  );

  const total = dailyHistories.reduce(
    (acc, cur) => acc + (Number(cur.deposit) - Number(cur.withdraw)),
    0
  );
  const blastTotal = blastDailyHistories.reduce(
    (acc, cur) => acc + (Number(cur.deposit) - Number(cur.withdraw)),
    0
  );
  const mantleTotal = mantleDailyHistories.reduce(
    (acc, cur) => acc + (Number(cur.deposit) - Number(cur.withdraw)),
    0
  );

  return {
    ["base:" + ADDRESSES.base.USDbC]: total,
    ["blast:" + ADDRESSES.blast.USDB]: blastTotal,
    ["mantle:" + "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34"]: mantleTotal,
  };
}

module.exports = {
  timetravel: false,
  start: BETA_START,
  base: {
    tvl: async ({ timestamp }) => {
      return getTVL(timestamp);
    },
  },
  hallmarks: [
    [1700006400, "Open Beta Start"],
    [1704200400, "0.8.2 Migration"],
    [BLAST_DEPLOY, "Blast Deploy"],
    [MANTLE_DEPLOY, "Mantle Deploy"],
  ],
};
