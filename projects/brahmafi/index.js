const axios = require("axios");

const BASE_URL = 'https://gtw.brahma.fi'
const ENDPOINTS = {
  tvl:'/v1/accounts/growth/tvl'
}
const SUPPORTED_CHAINS = ['ethereum', 'optimism', 'bsc', 'sei', 'swellchain', 'base', 'mode', 'arbitrum', 'berachain', 'blast', 'scroll']

const getTvlByChain = (chainName) => {
  const getTvl = async (api) => {
    const tvls = (await axios.get(`${BASE_URL}${ENDPOINTS.tvl}`))?.data?.data || []
    const found = tvls.find((t) => t.chainName === chainName)
    
    api.addUSDValue(found ? found.tvlUSD : 0)
  }

  return getTvl
}

const chainTvlData = SUPPORTED_CHAINS.reduce((acc, chain) => {
  acc[chain] = { tvl: getTvlByChain(chain) }
  return acc
}, {})

module.exports = {
  methodology:
    "TVL consists of total deposits in Brahma accounts, automation and agents.",
  ...chainTvlData 
};