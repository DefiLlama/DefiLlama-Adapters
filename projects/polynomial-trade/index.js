const axios = require('axios')
// const chain = 'optimism'

// api
const BASE_URL = "https://perps-api-experimental.polynomial.fi/snx-perps/tvl";
const api = axios.create({
  baseURL: BASE_URL,
});

async function tvl (timestamp, ethBlock) {
  const perpApi = await api.get();
  return {
    'ethereum:0x57Ab1ec28D129707052df4dF418D58a2D46d5f51': perpApi.data.tvl * 1e18
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