const axios = require("axios");

const STATS_BASE_URL = "https://gitlab.com/0353F40E/anyhedge-stats/-/raw/master/stats_daily";

async function getDailyTVL(day) {
  // Data & calculation method is fully reproducible, see:
  // https://gitlab.com/0353F40E/anyhedge-stats/-/blob/master/readme.md
  try {
    let { data } = await axios.get(`${STATS_BASE_URL}/${day}.csv`);
    const parsed = parseCSV(data);
    if (parsed.length > 0 && parsed[0].tvl !== undefined)
      return Number(parsed[0].tvl);
    return null;
  } catch {
    return null;
  }
}

function dayFromTimestamp(ts) {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

function addDays(dayStr, n) {
  const d = new Date(`${dayStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

async function tvl({ timestamp }) {
  // TVL data lags by contract duration since contracts are secret until
  // settled.  For this reason we report the most recent data point that is at
  // least 91 days old, which ensures all contracts open on that day have been
  // revealed.  We walk backwards from (today - 91d) until we find a row with
  // data.
  const today = new Date().toISOString().slice(0, 10);
  const cutoff = addDays(today, -91);

  // Start from the cutoff date (or the requested date if it is older)
  let day = dayFromTimestamp(timestamp);
  if (day > cutoff) day = cutoff;

  // Walk backwards up to 7 days to find available data
  for (let i = 0; i <= 7; i++) {
    const tvlValue = await getDailyTVL(day);
    if (tvlValue !== null) {
      return { "bitcoin-cash": tvlValue.toFixed(0) };
    }
    day = addDays(day, -1);
  }

  throw new Error("Unable to determine AnyHedge TVL.");
}

module.exports = {
  methodology:
    "Scrape the blockchain and filter for spent transaction outputs that match the contract's input script template. Aggregate them to compute TVL. The TVL data lags by contract duration since contracts are secret until settled. So, TVL at the current time will always be 0 and can only be calculated in retrospect and stats back-filled when contracts are revealed. For this reason, the code reports data that is at least 91 days old. See here for more details: https://gitlab.com/0353F40E/anyhedge-stats/-/blob/master/readme.md",
  start: '2022-06-09',
  bitcoincash: { tvl },
  hallmarks: [
    ['2023-04-17', "BCH Bull public release (AnyHedge v0.11 contract)"],
    ['2023-12-20', "BCH Bull enables early settlement feature"],
    ['2024-07-10', "BCH Bull enables leveraged shorting feature (AnyHedge v0.12 contract)"],
  ],
};

function parseCSV(csvData) {
  csvData = csvData.replaceAll('\r', '').split('\n').map(i => i.split(','));
  const headers = csvData.shift();
  return csvData.map(row => toObject(headers, row)).filter(row => row.day);
}

function toObject(keys, values) {
  const res = {};
  keys.forEach((key, i) => {
    res[key] = values[i];
  });
  return res;
}
