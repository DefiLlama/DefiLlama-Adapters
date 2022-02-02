const sdk = require('@defillama/sdk');
const axios = require('axios');
const _ = require('underscore');



async function getTvl (network) {
  const resp = await axios.get(`https://api.tranche.finance/api/v1/common/tvl/${ network }`);
  return resp.data.result;
}

async function ethTvl () {
  return getTvl('ethereum');
}
async function polygonTvl () {
  return getTvl('polygon');
}

async function fantomTvl () {
  return getTvl('ftm');
}

async function avaxTvl () {
  return getTvl('avax');
}

async function fetch () {
  return await ethTvl() + await polygonTvl() + await fantomTvl() + await avaxTvl();
}

module.exports = {
  start: 1621340071,
  ethereum: {
    fetch: ethTvl
  },
  polygon: {
    fetch: polygonTvl
  },
  avax: {
    fetch: avaxTvl
  },
  fantom: {
    fetch: fantomTvl
  },
  fetch
}