const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http');

// api
const BASE_URL = "https://perps-v2-mainnet.polynomial.fi/snx-perps/tvl";

async function tvl (timestamp, ethBlock) {
  const perpApi = await get(BASE_URL);
  return {
    [`ethereum:${ADDRESSES.ethereum.sUSD}`]: perpApi.tvl * 1e18
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