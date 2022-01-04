const utils = require('./helper/utils');

/* * * * * * * *
 * ==> Correct adapter needs to be created.
 *
 *****************/
async function fetch() {
  var totalTvl = await utils.fetchURL(
    'https://us-central1-dh-alpha.cloudfunctions.net/stats'
  );
  return totalTvl.data.protocolStats.totalAssetUnderManagement;
}

async function ethereum() {
  var totalTvl = await utils.fetchURL(
    'https://us-central1-dh-alpha.cloudfunctions.net/stats'
  );
  return totalTvl.data.protocolStats.ethereum.totalAumEthereum;
}

async function polygon() {
  var totalTvl = await utils.fetchURL(
    'https://us-central1-dh-alpha.cloudfunctions.net/stats'
  );
  return totalTvl.data.protocolStats.polygon.totalAumPolygon;
}

module.exports = {
  ethereum: {
    fetch: ethereum,
  },
  polygon: {
    fetch: polygon,
  },
  fetch,
};
