const axios = require('axios');
const { getApiTvl } = require('./helper/historicalApi');
const sdk = require('@defillama/sdk')

const historicalUrl = "https://pnetwork.watch/api/datasources/proxy/1/query?db=pnetwork-volumes-1&q=SELECT%20sum(%22tvl_number%22)%20FROM%20%22tvl_test%22%20WHERE%20time%20%3E%3D%201600150697388ms%20GROUP%20BY%20time(1d)%2C%20%22host_blockchain%22%3BSELECT%20sum(%22tvl_number%22)%20FROM%20%22tvl_test%22%20WHERE%20time%20%3E%3D%201600150697388ms%20GROUP%20BY%20time(1d)%20fill(null)&epoch=ms"
const currentUrl = "https://chart.ptokens.io/index.php?a=assets"

function getChainTvl(chain) {
    async function current() {
        let response = await axios.get(currentUrl)
        return response.data.filter(c=>c.hostBlockchain===chain).reduce((total, asset)=>total+asset.tvl_number, 0);
    }

    async function historical() {
        let response = await axios.get(historicalUrl)
        return response.data.results[0].series.find(s=>s.tags.host_blockchain === chain).values.map(d => ({
            date: d[0] / 1000,
            totalLiquidityUSD: d[1]
        }))
    }
    return async (time)=> {
        return getApiTvl(time, current, historical)
    }
}

const chains = {
    "ethereum": "eth",
    "polygon": "polygon",
    "bsc": "bsc",
    "eos": "eos",
    "telos": "telos",
    "ultra": "ultra",
    "xdai": "xdai"
}
const chainTvls = Object.fromEntries(Object.entries(chains).map(c=>[c[0], {
    tvl:getChainTvl(c[1])
}]))

module.exports = {
    ...chainTvls,
    tvl: sdk.util.sumChainTvls(Object.values(chains).map(getChainTvl)),
    methodology: 'Queries the pNetwork database, using the same API endpoint as their own UI. TVL is based on the amount of assets “locked” in the system and that therefore has a 1:1 tokenisation on a host blockchain, including all of the assets and all of the blockchains supported by pNetwork.'
};
