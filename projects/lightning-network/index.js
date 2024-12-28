const { get } = require("../helper/http");

const dayHistory = {};

async function GetDailyHistory() {
  let data = await get('https://bitcoinvisuals.com/static/data/data_daily.csv');
  data = parseCSV(data);

  data.forEach((row) => {
    if (!row.capacity_total) return;
    dayHistory[row.day] = row.capacity_total;
  });
}

async function get1MLCapacity() {
  try {
    const data = await get('https://1ml.com/statistics?json=true')
    return data.networkcapacity / 1e8
  } catch (e) {
    console.error(e)
    return getFromTxStat()
  }
}

async function getFromTxStat() {
  const data = await get('https://txstats.com/api/datasources/proxy/1/query?db=p2shinfo&q=SELECT%20last(%22value%22)%20%20%2F%20100000000%20FROM%20%22ln_stats%22%20WHERE%20time%20%3E%3D%20now()%20-%201d%20GROUP%20BY%20time(6h)%20fill(null)&epoch=ms')
  return data.results[0].series[0].values.pop()[1]
}

async function getChannelCapacity(timestamp) {
  const day = new Date(timestamp * 1000).toISOString().slice(0, 10)
  return dayHistory[day]
}

async function tvl({ timestamp }) {
  const getCurrentTVL = (Date.now() / 1000 - timestamp) < 24 * 3600 // if the time difference is under 24 hours i.e we are not refilling old data
  let channelCapacity

  if (getCurrentTVL) {
    channelCapacity = await get1MLCapacity()
  } else {
    await GetDailyHistory();
    channelCapacity = await getChannelCapacity(timestamp)
  }

  // if none of our scrape targets worked then throw an error
  if (channelCapacity == null)
    throw "Unable to determine LN channel capacity."

  return {
    bitcoin: channelCapacity
  }
}

module.exports = {
  start: '2018-01-20',
  bitcoin: { tvl },
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