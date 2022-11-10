const axios = require('axios');

async function fetchBsc() {
  let bsc = await axios.get('https://api.wault.finance/waultTotalValueLocked.json');
  return bsc.data.protocolTvl;
}

async function fetchPoly() {
  let poly = await axios.get('https://polyapi.wault.finance/waultTotalValueLocked.json');
  return poly.data.protocolTvl;
}

async function fetch() {
  let poly = await axios.get('https://polyapi.wault.finance/waultTotalValueLocked.json');
  let bsc = await axios.get('https://api.wault.finance/waultTotalValueLocked.json');
  const tvl = poly.data.protocolTvl + bsc.data.protocolTvl;
  return tvl;
}

module.exports = {
  bsc: {
    fetch: () => 0
  },
  polygon: {
    fetch: () => 0
  },
  fetch: () => 0 // Project was initially relaunced as thorus.fi but it is dead now
}
