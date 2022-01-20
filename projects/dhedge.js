const utils = require('./helper/utils');

/* * * * * * * *
 * ==> Correct adapter needs to be created.
 *
 *****************/

const STATS_URL = 'https://us-central1-dh-alpha.cloudfunctions.net/stats';

async function fetch() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.protocolStats.totalAssetUnderManagement;
}

async function ethereum() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.protocolStats.ethereum.totalAumEthereum;
}

async function polygon() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.protocolStats.polygon.totalAumPolygon;
}

async function optimism() {
  var totalTvl = await utils.fetchURL(STATS_URL);
  return totalTvl.data.protocolStats.optimism.totalAumOptimism;
}

module.exports = {
  ethereum: {
    fetch: ethereum,
  },
  polygon: {
    fetch: polygon,
  },
  optimism: {
    fetch: optimism,
  },
  fetch,
};
