const { toUSDTBalances } = require("../helper/balances");
const { get } = require("../helper/http");

async function tvl(ts) {
  const data = await get(
    "https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/sui/deepbook?interval=day&timeFrame=all&dataType=tvl"
  );
  return toUSDTBalances(findClosestTvl(data, ts.timestamp));
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  sui: {
    tvl,
  },
};

function findClosestTvl(data, ts) {
  ts = ts * 1000; // Convert to milliseconds
  // Parsing the date string to a Date object
  data.forEach((i) => {
    i.ts = new Date(i.date);
  });

  // Filtering data less than a day old and before timestamp ts
  data = data.filter((i) => i.ts < ts && ts - i.ts < 86400000);

  let aggregatedTvl = {};
  data.forEach((item) => {
    // there should be no duplicate alias, if they are, the latest one will be used
    aggregatedTvl[item.alias] = item.value;
  });

  // Sum all unique values together
  let totalTvl = Object.values(aggregatedTvl).reduce((acc, current) => acc + current, 0);

  return totalTvl;
}
