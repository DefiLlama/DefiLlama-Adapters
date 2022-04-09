const utils = require('../helper/utils');

const STATS_URL = 'https://api.nordfinance.io/tvl/statistics';

async function fetch() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.tvl.totalTvl - totalTvl.data.tvl.lpStaking.totalLpStaking - totalTvl.data.tvl.staking.totalStaking;
}  

async function ethereum() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.tvl.ethereum - totalTvl.data.tvl.lpStaking.ethereum - totalTvl.data.tvl.staking.ethereum;
}

async function polygon() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.tvl.polygon - totalTvl.data.tvl.lpStaking.polygon - totalTvl.data.tvl.staking.polygon;
}

async function avalanche() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.tvl.avalanche - totalTvl.data.tvl.lpStaking.avalanche - totalTvl.data.tvl.staking.avalanche;
}

async function pool2() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.tvl.lpStaking.totalLpStaking;
}

async function staking() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.tvl.staking.totalStaking;
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
  },
  pool2: {
    fetch: pool2
  },
  staking: {
    fetch: staking
  }
}; // node test.js projects/nord-finance/index.js