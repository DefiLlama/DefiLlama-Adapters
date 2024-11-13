const axios = require("axios");

async function GetDailyHistory(day) {
  // Data & calculation method is fully reproducible, see:
  // https://gitlab.com/0353F40E/anyhedge-stats/-/blob/master/readme.md
  try {
    let { data } = await axios.get(`https://gitlab.com/0353F40E/anyhedge-stats/-/raw/master/stats_daily/${day}.csv`);
    data = parseCSV(data);
    return data[0].tvl;
  } catch {
      return null;
  }
}

async function getTVLAnyHedge(timestamp) {
  const day = new Date(timestamp * 1000).toISOString().slice(0,10)
  return await GetDailyHistory(day);
}

async function tvl({timestamp}) {
  let tvlAnyHedge, testDataSource

  // tvl data lags by contract duration since contracts are secret until settled
  // so tvl at current time will always be 0, and only later when contracts are revealed
  // can it be calculated in retrospect and stats back-filled
  // for this reason, we cut-off the data at (today-91d)
  const lastTimestamp = Math.floor(new Date().getTime() / 1000 - 91*86400);
  if (timestamp > lastTimestamp)
    throw "Data for the date is incomplete, awaiting contract reveals."

  tvlAnyHedge = await getTVLAnyHedge(timestamp)
  testDataSource = await getTVLAnyHedge(timestamp + 91*86400)

  // if we're querying data for `timestamp`, a row for `timestamp+91d` should exist
  if (testDataSource == null)
    throw "Data source hasn't been updated yet."

  // if none of our scrape targets worked then throw an error
  if (tvlAnyHedge == null)
    throw "Unable to determine AnyHedge TVL."
  
  const bchTvl = Number(tvlAnyHedge).toFixed();

  return {
    'bitcoin-cash': bchTvl
  }
}

module.exports = {
  methodology: "Scrape the blockchain and filter for spent transaction outputs that match the contract's input script template. Aggregate them to compute TVL. The TVL data lags by contract duration since contracts are secret until settled. So, TVL at the current time will always be 0 and can only be calculated in retrospect and stats back-filled when contracts are revealed. For this reason, the code cuts-off the data at 91 days ago. See here for more details: https://gitlab.com/0353F40E/anyhedge-stats/-/blob/master/readme.md",
  start: 1654787405,
  bitcoincash: { tvl },
  hallmarks: [
    [1681725240, "BCH Bull public release (AnyHedge v0.11 contract)"],
    [1703054100, "BCH Bull enables early settlement feture"],
    [1720612800, "BCH Bull enables leveraged shorting feature (AnyHedge v0.12 contract)"]
  ]
};

function parseCSV(csvData) {
  csvData = csvData.replaceAll('\r', '').split('\n').map(i => i.split(','))
  const headers = csvData.shift()
  return csvData.map(row => toObject(headers, row))
}

function toObject(keys, values) {
  const res = {}
  keys.forEach((key, i) => {
    res[key] = values[i]
  })
  return res
}
