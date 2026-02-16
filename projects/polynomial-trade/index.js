const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http');
const { sumTokensExport } = require('../helper/unwrapLPs')
// api
const BASE_URL = "https://perps-v2-mainnet.polynomial.fi/snx-perps/tvl";

const BASE_URL_POLYNOMIAL_CHAIN = "https://perps-api-mainnet.polynomial.finance/core/portfolio/tvl";

async function tvl_optimism_chain (timestamp, ethBlock) {
  const perpApi = await get(BASE_URL);
  return {
    [`ethereum:${ADDRESSES.ethereum.sUSD}`]: perpApi.tvl * 1e18
  };
}

module.exports = {
  optimism: {
    tvl:tvl_optimism_chain
  },
  polynomial: {
    tvl: sumTokensExport({ owner: '0xc133983D6d9140923b5eaE52664221d9099cf119', tokens: [ADDRESSES.polynomial.solvBtc,ADDRESSES.polynomial.weETH, ADDRESSES.polynomial.wstEth, ADDRESSES.polynomial.wETH]})
  },
  hallmarks:[
    ['2023-03-27', "Trade Launch"],
    ['2024-08-21', "Polynomial Trade Launch"],
    ['2025-05-13', "Multicollateral Launch"]
    
  ]
}