const axios = require('axios');
const { getApiTvl } = require('./helper/historicalApi');

async function current() {
    let response = await axios.get('https://pnetwork.watch/api/datasources/proxy/1/query?db=pnetwork-volumes-1&q=SELECT%20%22tvl%22%20FROM%20%22tvl%22%20WHERE%20time%20%3E%3D%20now()%20-%201d&epoch=ms')
    return response.data.results[0].series[0].values.slice(-1)[0][1];
}
async function tvl(time) {
    return getApiTvl(time, current, async () =>{
        let response = await axios.get('https://pnetwork.watch/api/datasources/proxy/1/query?db=pnetwork-volumes-1&q=SELECT%20%22tvl%22%20FROM%20%22tvl%22%20WHERE%20time%20%3E%3D%20now()%20-%201d&epoch=ms')
        return response.data.results[0].series[0].values.map(d=>({
            date: d[0]/1000,
            totalLiquidityUSD: d[1]}))
    })
}

module.exports = {
    tvl,
    methodology: 'Queries the pNetwork database, using the same API endpoint as their own UI. TVL is based on the amount of assets “locked” in the system and that therefore has a 1:1 tokenisation on a host blockchain, including all of the assets and all of the blockchains supported by pNetwork.'
  };
