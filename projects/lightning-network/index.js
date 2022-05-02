const axios = require("axios");
const moment = require("moment");
const _ = require("underscore");

let historyTimestamp = 0;

async function GetDailyHistory() {
  let timestamp = moment().startOf('day').unix();
  if (timestamp == historyTimestamp) return;

  dayHistory = {};
  let { data } = await axios.get('https://bitcoinvisuals.com/static/data/data_daily.csv');
  data = parseCSV(data);

  data.forEach((row) => {
    if (!row.capacity_total) return;
    let timestamp = moment(row.day, '').utcOffset(0).startOf('day').add(1, 'day').unix();
    dayHistory[timestamp] = row.capacity_total;
  });

  historyTimestamp = timestamp;
}

async function get1MLCapacity() {
  try {
    const { data } = await axios.get('https://1ml.com/statistics?json=true')
    return data.networkcapacity / 1e8
  } catch (e) {
    return getFromTxStat()
  }
}

async function getFromTxStat() {
  const { data } = await axios.get('https://txstats.com/api/datasources/proxy/1/query?db=p2shinfo&q=SELECT%20last(%22value%22)%20%20%2F%20100000000%20FROM%20%22ln_stats%22%20WHERE%20time%20%3E%3D%20now()%20-%201d%20GROUP%20BY%20time(6h)%20fill(null)&epoch=ms')
  return data.results[0].series[0].values.pop()[1]
}

async function getChannelCapacity(timestamp) {
  if (dayHistory[timestamp] && moment().utcOffset(0).startOf('hour').unix() != timestamp)
    return dayHistory[timestamp];
  return get1MLCapacity()
}

async function tvl(timestamp) {
  await GetDailyHistory();
  let channelCapacity = await getChannelCapacity(timestamp);

  // if none of our scrape targets worked then throw an error
  if (channelCapacity == null)
    throw "Unable to determine LN channel capacity."

  return {
    bitcoin: channelCapacity
  }
}

module.exports = {
  start: 1516406400,
  bitcoin: { tvl },
};


function parseCSV(csvData) {
  csvData = csvData.replaceAll('\r', '').split('\n').map(i => i.split(','))
  const headers = csvData.shift()
  return csvData.map(row => _.object(headers, row))
}