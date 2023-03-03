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
  const day = new Date((timestamp - 30*24*3600) * 1000).toISOString().slice(0,10) // tvl data lags by contract duration since contracts are secret until settled
  return dayHistory[day]
}

async function tvl(timestamp) {
  let tvlAnyHedge

  await GetDailyHistory();
  tvlAnyHedge = await getTVLAnyHedge(timestamp)

  // if none of our scrape targets worked then throw an error
  if (tvlAnyHedge == null)
    throw "Unable to determine AnyHedge TVL."

  return {
    bitcoincash: tvlAnyHedge
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
