const utils = require('./helper/utils');

const bscEndpoint = "https://static.autofarm.network/bsc/farm_data.json"
const polygonEndpoint = "https://static.autofarm.network/polygon/stats.json"
const hecoEndpoint = "https://api2.autofarm.network/heco/get_stats"

async function polygon() {
  const data = await utils.fetchURL(polygonEndpoint)
  return data.data.platformTVL
}

async function heco() {
  const data = await utils.fetchURL(hecoEndpoint)
  return data.data.platformTVL
}


async function bsc() {
  var bscPools = await utils.fetchURL(bscEndpoint)
  let tvl = Object.values(bscPools.data.pools).reduce((total, pool) => total + (pool.poolWantTVL || 0), 0)
  return tvl
}

async function fetch() {
  return (await polygon())+(await heco())+(await bsc())
}
fetch().then(console.log)

module.exports = {
  bsc:{
    fetch:bsc
  },
  heco:{
    fetch: heco
  },
  polygon:{
    fetch: polygon
  },
  fetch
}
