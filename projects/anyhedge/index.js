const axios = require("axios");


const dayHistory = {};

async function GetDailyHistory() {
  let { data } = await axios.get('https://gitlab.com/0353F40E/anyhedge-stats/-/raw/master/stats_daily.csv');
  data = parseCSV(data);

  data.forEach((row) => {
    if (!row.tvl) return;
    dayHistory[row.day] = row.tvl;
  });
}

async function getTVLAnyHedge(timestamp) {
  const day = new Date(timestamp * 1000).toISOString().slice(0,10)
  return dayHistory[day]
}

async function tvl(timestamp) {
  let tvlAnyHedge

  // tvl data lags by contract duration since contracts are secret until settled
  // so tvl at current time will always be 0, and only later when contracts are revealed
  // can it be calculated in retrospect and stats back-filled
  // for this reason, we cut-off the data at (today-31d)
  const lastTimestamp = Math.floor(new Date().getTime() / 1000 - 31*86400);
  if (timestamp >= lastTimestamp)
    throw "Data for the date is incomplete, awaiting contract reveals."

  await GetDailyHistory();
  tvlAnyHedge = await getTVLAnyHedge(timestamp)

  // if none of our scrape targets worked then throw an error
  if (tvlAnyHedge == null)
    throw "Unable to determine AnyHedge TVL."
  
  const bchTvl = Number(tvlAnyHedge).toFixed();

  return {
    'bitcoin-cash': bchTvl
  }
}

module.exports = {
  start: 1654787405,
  bitcoincash: { tvl },
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
