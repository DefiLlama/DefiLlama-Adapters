const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http');

// api
const BASE_URL = "https://perps-v2-mainnet.polynomial.fi/snx-perps/tvl";

const BASE_URL_POLYNOMIAL_CHAIN = "https://perps-api-mainnet.polynomial.finance/core/portfolio/tvl";

async function tvl_optimism_chain (timestamp, ethBlock) {
  const perpApi = await get(BASE_URL);
  return {
    [`ethereum:${ADDRESSES.ethereum.sUSD}`]: perpApi.tvl * 1e18
  };
}

async function tvl_polynomial_chain(timestamp, ethBlock) {
  const perpApi = await get(BASE_URL_POLYNOMIAL_CHAIN);
  return {
    [`ethereum:${ADDRESSES.ethereum.USDC}`]: perpApi.tvl * 1e6
  };
}

module.exports = {
  optimism: {
    tvl:tvl_optimism_chain
  },
  polynomial: {
    tvl: tvl_polynomial_chain
  },
  hallmarks:[
    [1679918400, "Trade Launch"],
    [1724248800, "Polynomial Trade Launch"]
  ]
}