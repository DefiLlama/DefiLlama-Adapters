const ADDRESSES = require('../helper/coreAssets.json')
const axios = require('axios')

// api
const BASE_URL = "https://perps-api-experimental.polynomial.fi/snx-perps/tvl";
const api = axios.create({
  baseURL: BASE_URL,
});

async function tvl (timestamp, ethBlock) {
  const perpApi = await api.get();
  return {
    [`ethereum:${ADDRESSES.ethereum.sUSD}`]: perpApi.data.tvl * 1e18
  };
}

module.exports = {
  optimism: {
    tvl
  },
  hallmarks:[
    [1679918400, "Trade Launch"]
  ]
}