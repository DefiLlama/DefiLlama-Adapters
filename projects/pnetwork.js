const axios = require('axios');
const { getApiTvl } = require('./helper/historicalApi');

const historicalUrl = "https://pnetwork.watch/api/datasources/proxy/1/query?db=pnetwork-volumes-1&q=SELECT%20sum(%22tvl_number%22)%20FROM%20%22tvl_test%22%20WHERE%20time%20%3E%3D%201600150697388ms%20GROUP%20BY%20time(1d)%2C%20%22host_blockchain%22%3BSELECT%20sum(%22tvl_number%22)%20FROM%20%22tvl_test%22%20WHERE%20time%20%3E%3D%201600150697388ms%20GROUP%20BY%20time(1d)%20fill(null)&epoch=ms"
const currentUrl = "https://chart.ptokens.io/index.php?a=assets"
let _response

function getChainTvl(chain) {
  async function current() {
    if (!_response) _response = axios.get(currentUrl)
    let response = await _response
    return response.data.filter(c => c.nativeBlockchain === chain && !['EFX', 'PNT',].includes(c.name)).reduce((total, asset) => total + asset.tvl_number, 0);
  }

  async function historical() {
    let response = await axios.get(historicalUrl)
    return response.data.results[0].series.find(s => s.tags.host_blockchain === chain).values.map(d => ({
      date: d[0] / 1000,
      totalLiquidityUSD: d[1]
    }))
  }
  return async (time) => {
    return getApiTvl(time, current, historical)
  }
}

const chains = {
  "ethereum": "eth",
  "bsc": "bsc",
  "eos": "eos",
  "telos": "telos",
  "bitcoin": "btc",
  "ore": "ore",
  "litecoin": "ltc",
  "doge": "dogecoin",
  "lbry": "lbry",
  "rvn": "rvn",
  "fantom": "fantom",
  "polygon": "polygon",
  "ultra": "ultra",
  "xdai": "xdai",
  // "algorand": "algorand",
  // "arbitrum": "arbitrum",
  // "luxochain": "luxochain",
}

module.exports = {
  timetravel: false,
  methodology: 'Queries the pNetwork database, using the same API endpoint as their own UI. TVL is based on the amount of assets “locked” in the system and that therefore has a 1:1 tokenisation on a host blockchain, including all of the assets and all of the blockchains supported by pNetwork.'
};

Object.entries(chains).forEach(([chain, key]) => {
  module.exports[chain] = { tvl: getChainTvl(key) }
})
