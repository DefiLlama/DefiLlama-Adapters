const utils = require('./helper/utils');

async function fetch() {
  var totalTvl = await utils.fetchURL('https://aave-api-v2.aave.com/data/tvl')
  return totalTvl.data.totalTvl.tvlInUsd;
}

async function eth() {
  var totalTvl = await utils.fetchURL('https://aave-api-v2.aave.com/data/tvl')
  return totalTvl.data.totalTvl.tvlInUsd - totalTvl.data.marketTvls.matic.tvlInUsd;
}

async function polygon() {
  var totalTvl = await utils.fetchURL('https://aave-api-v2.aave.com/data/tvl')
  return totalTvl.data.marketTvls.matic.tvlInUsd;
}

module.exports = {
  ethereum: {
    fetch: eth
  },
  polygon: {
    fetch: polygon
  },
  fetch
}
