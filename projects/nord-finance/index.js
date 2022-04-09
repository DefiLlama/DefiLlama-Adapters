const utils = require('../helper/utils');

const STATS_URL = 'https://api.nordfinance.io/tvl/statistics';

async function fetch() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.tvl.totalTvl;
}  

async function ethereum() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.tvl.ethereum;
}

async function polygon() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.tvl.polygon;
}

async function avalanche() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.tvl.avalanche;
}

module.exports = {
  methodology: `TVL is obtained by making calls to the Nord Finance API "https://api.nordfinance.io/tvl/statistics".`,
  fetch,
  ethereum: {
    fetch: ethereum,
  },
  polygon: {
    fetch: polygon,
  },
  avalanche: {
    fetch: avalanche,
  }
};