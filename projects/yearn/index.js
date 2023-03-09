const axios = require('axios')
const { getApiTvl } = require('../helper/historicalApi')

async function ethereum(timestamp) {
    return getApiTvl(timestamp, async () => {
        const tvl = await axios.get('https://api.yearn.finance/v1/chains/1/vaults/all')
        return tvl.data.reduce((all, vault) => all + vault.tvl.tvl, 0)
    }, async () => {
        /*
        Outdated as of Dec 2022
        const historicalTvls = Object.entries((await axios.get('https://yearn.science/v1/tvl')).data)
            .map(([date, tvl]) => [Date.parse(date)/1000, tvl]).sort(([date1], [date2]) => date1 - date2);
        */
        const ibTvl = await axios.post("https://yearn.vision/api/ds/query", { "queries": [{ "datasource": { "uid": "PBFE396EC0B189D67", "type": "prometheus" }, "expr": "(sum(ironbank{network=\"ETH\", param=\"tvl\"}) or vector(0))", "utcOffsetSec": 0, "datasourceId": 1 }], "from": "1639958400000", "to": Date.now().toString() })
        const totalTvl = await axios.post("https://yearn.vision/api/ds/query", { "queries": [{ "datasource": { "uid": "PBFE396EC0B189D67", "type": "prometheus" }, "expr": "(sum(ironbank{network=\"ETH\", param=\"tvl\"}) or vector(0)) + (sum(yearn_vault{network=\"ETH\", param=\"tvl\"}) or vector(0))", "utcOffsetSec": 0, "datasourceId": 1 }], "from": "1639958400000", "to": Date.now().toString() })
        const result = []
        const [tvlTimestamps, tvls] = totalTvl.data.results.A.frames[0].data.values
        const [ibTimestamps, ib] = ibTvl.data.results.A.frames[0].data.values
        tvlTimestamps.forEach((time, index) => {
            const ibIndex = ibTimestamps.indexOf(time)
            const tvl = tvls[index] - ib[ibIndex]
            result.push({
                date: Math.round(time / 1000),
                totalLiquidityUSD: tvl
            })
        })
        return result
    })
}

async function fantom(timestamp) {
    return getApiTvl(timestamp, async () => {
        const tvl = await axios.get('https://api.yearn.finance/v1/chains/250/vaults/all')
        const total = tvl.data.reduce((all, vault) => all + vault.tvl.tvl, 0)
        if(total === 0){ throw new Error("TVL can't be 0")}
        return total
    }, async () => {
        const totalTvl = await axios.post("https://yearn.vision/api/ds/query", {"queries":[{"datasource":{"uid":"PBFE396EC0B189D67","type":"prometheus"},"expr":"(sum(ironbank{network=\"FTM\", param=\"tvl\"}) or vector(0)) + (sum(yearn_vault{network=\"FTM\", param=\"tvl\"}) or vector(0))", "utcOffsetSec":0,"datasourceId":1}],"from":"1642091361529","to": Date.now().toString() })
        const result = []
        const [tvlTimestamps, tvls] = totalTvl.data.results.A.frames[0].data.values
        tvlTimestamps.forEach((time, index) => {
            const tvl = tvls[index]
            result.push({
                date: Math.round(time / 1000),
                totalLiquidityUSD: tvl
            })
        })
        return result
    })
}

async function arbitrum(timestamp) {
    return getApiTvl(timestamp, async () => {
        const tvl = await axios.get('https://api.yearn.finance/v1/chains/42161/vaults/all')
        const total = tvl.data.reduce((all, vault) => all + vault.tvl.tvl, 0)
        if(total === 0){ throw new Error("TVL can't be 0")}
        return total
    }, async () => {
        const totalTvl = await axios.post("https://yearn.vision/api/ds/query", {"queries":[{"datasource":{"uid":"PBFE396EC0B189D67","type":"prometheus"},"expr":"(sum(ironbank{network=\"AETH\", param=\"tvl\"}) or vector(0)) + (sum(yearn_vault{network=\"AETH\", param=\"tvl\"}) or vector(0))", "utcOffsetSec":0,"datasourceId":1}],"from":"1645565848000","to": Date.now().toString() })
        const result = []
        const [tvlTimestamps, tvls] = totalTvl.data.results.A.frames[0].data.values
        tvlTimestamps.forEach((time, index) => {
            const tvl = tvls[index]
            result.push({
                date: Math.round(time / 1000),
                totalLiquidityUSD: tvl
            })
        })
        return result
    })
}

async function optimism(timestamp) {
    return getApiTvl(timestamp, async () => {
        const tvl = await axios.get('https://api.yearn.finance/v1/chains/10/vaults/all')
        const total = tvl.data.reduce((all, vault) => all + vault.tvl.tvl, 0)
        if(total === 0){ throw new Error("TVL can't be 0")}
        return total
    }, async () => {
        throw new Error("No historical data for optimism")
    })
}

module.exports = {
    doublecounted: true,
    misrepresentedTokens: true,
    timetravel: false,
    fantom: {
        tvl: fantom
    },
    ethereum: {
        tvl: ethereum
    },
    arbitrum: {
        tvl: arbitrum
    },
    optimism: {
        tvl: optimism
    },
    hallmarks:[
      [1594944000, "YFI token Launch"],
   ]
};

