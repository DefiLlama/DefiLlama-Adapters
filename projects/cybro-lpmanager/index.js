const axios = require('axios');

const API_ENDPOINT = 'https://v2-api.cybro.io/api/v1/dashboard/aum';

const chainIdMap = {
  arbitrum: 42161,
  base: 8453,
  unichain: 130,
};

const config = {
  arbitrum: {
    lpManager: '0x0964B7A10631f2139dcf2e0aa1b621F97a19e998',
  },
  base: {
    lpManager: '0xB3dA213b0005dF568A222876e5F5DB61C985936F',
  },
  unichain: {
    lpManager: '0x7aD4e1e8FAe276B9debb40340Dc65d6A2274189B',
  },
};

async function fetchAUM(chain) {
    const chainId = chainIdMap[chain];
    const response = await axios.get(API_ENDPOINT, { params: { chain_id: chainId } });
    return response.data.aum_usd || 0;
}

module.exports = {
  doublecounted: false,
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async () => {
      const aum = await fetchAUM(chain);
      return { [chain]: aum };
    }
  };
});
