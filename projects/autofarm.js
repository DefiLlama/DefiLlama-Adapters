const utils = require('./helper/utils');

const bscEndpoint = "https://static.autofarm.network/bsc/farm_data.json"
const polygonEndpoint = "https://static.autofarm.network/polygon/stats.json"
const hecoEndpoint = "https://static.autofarm.network/heco/stats.json"
const avaxEndpoint = "https://static.autofarm.network/avax/stats.json"
const fantomEndpoint = "https://static.autofarm.network/fantom/stats.json"

async function fantom() {
  const data = await utils.fetchURL(fantomEndpoint)
  return data.data.platformTVL
}

async function avax() {
  const data = await utils.fetchURL(avaxEndpoint)
  return data.data.platformTVL
}

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
  return (await polygon())+(await bsc())+(await heco())+(await avax())+(await fantom())
}

module.exports = {
  bsc:{
    fetch:bsc
  },
  polygon:{
    fetch: polygon
  },
  heco:{
    fetch: heco
  },
  avalanche:{
    fetch: avax
  },
  fantom:{
    fetch: fantom
  },
  fetch
}
