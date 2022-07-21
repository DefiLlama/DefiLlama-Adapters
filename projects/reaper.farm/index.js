const axios = require("axios");
const REAPER_API = "http://api.reaper.farm/api";

const client = axios.create({
  baseURL: REAPER_API
});

async function fetchTvl(chainName) {
  let tvlMsg;
  switch (chainName) {
    case 'fantom':
      tvlMsg = await client.get('/tvlTotal');
      break;
    case 'optimism':
      tvlMsg = await client.get('/optimism/tvlTotal');
      break;
    default:     
      tvlMsg = await client.get('/tvlTotal');
  }
  const tvl = tvlMsg.data.data.tvlTotal;
  return tvl;
}

module.exports = {
  methodology: `TVL is fetched from the Reaper API(http://api.reaper.farm/api)`,
  fantom: { 
    tvl: fetchTvl('fantom')
  },
  optimism: {
    tvl: fetchTvl('optimism')
  }
}
