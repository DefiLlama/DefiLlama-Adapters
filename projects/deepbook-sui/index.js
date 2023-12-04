const { toUSDTBalances } = require("../helper/balances");
const { get } = require("../helper/http");
const axios = require("axios");

async function tvl(ts) {
  const { data } = await axios.get(
    "https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/sui/deepbook?interval=hour&timeFrame=all&dataType=tvl"
  );
  return toUSDTBalances(findClosestTvl(data, ts));
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
    if (!aggregatedTvl[item.alias]) {
      aggregatedTvl[item.alias] = 0;
    }
    aggregatedTvl[item.alias] += item.value;
  });

  // Sum all unique values together
  let totalTvl = Object.values(aggregatedTvl).reduce(
    (acc, current) => acc + current,
    0
  );

  return totalTvl;
}
