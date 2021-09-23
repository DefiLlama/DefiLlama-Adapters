const utils = require('./helper/utils');
const farmDataEndpoint = "https://marketcap.moonfarm.finance/get-farms-data"

async function fetch() {
  const data = await utils.fetchURL(farmDataEndpoint)
  return data.data.tvlUSD
}

async function bsc() {
  const data = await utils.fetchURL(farmDataEndpoint)
  return data.data.tvlBSC
}

async function polygon() {
  const data = await utils.fetchURL(farmDataEndpoint)
  return data.data.tvlPoly
}

async function ethereum() {
  const data = await utils.fetchURL(farmDataEndpoint)
  return data.data.tvlETH
}

module.exports = {
  bsc:{
    fetch:bsc
  },
  polygon:{
    fetch: polygon
  },
  ethereum:{
    fetch: ethereum
  },
  fetch
}
