const ADDRESSES = require("./helper/coreAssets.json");
const { request } = require("graphql-request");

const config = {
  base: {
    token: ADDRESSES.base.USDbC,
    start: 1700006400,
    graphUrl:
      "https://api.goldsky.com/api/public/project_cm0bho0j0ji6001t8e26s0wv8/subgraphs/intentx-base-analytics-083/latest/gn",
    accountSource: "0x39EcC772f6073242d6FD1646d81FA2D87fe95314",
  },
};

async function tvl(api) {
  const { token, graphUrl, start, accountSource } = config[api.chain];
  const from = start.toString();
  const to = api.timestamp.toString();

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
  `;
  const { dailyHistories } = await request(graphUrl, query, { from, to });
  let total = dailyHistories.reduce((acc, cur) => acc + (Number(cur.deposit) - Number(cur.withdraw)), 0);
  if (api.chain === "mantle") total /= 1e12;
  api.add(token, total);
}

module.exports = {
  start: config.base.start,
  hallmarks: [[1751414400, "Open Beta Start"]],
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl,
  };
});
