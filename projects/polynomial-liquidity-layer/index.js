const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http');

// api
const BASE_URL = 'https://perps-api-mainnet.polynomial.finance/stats'

async function tvl(timestamp, ethBlock) {
  const tvlApi = await get(BASE_URL);
  return {
    [`ethereum:${ADDRESSES.ethereum.USDC}`]: tvlApi.tvl * 1e6
  };
}

module.exports = {
  polynomial: {
    tvl: tvl
  }
}