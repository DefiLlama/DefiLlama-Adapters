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
    fetch: fetchBsc
  },
  polygon: {
    fetch: fetchPoly
  },
  fetch
}
