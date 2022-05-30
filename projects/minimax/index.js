const retry = require('async-retry')
const axios = require("axios");

async function bsc() {
    const tvl_data = await retry(async bail => axios.get("https://api.minimax.finance/tvl/56"));
    return parseFloat(tvl_data.data.TvlTotal);
}

async function polygon() {
    const tvl_data = await retry(async bail => axios.get("https://api.minimax.finance/tvl/137"));
    return parseFloat(tvl_data.data.TvlTotal);
}

async function fantom() {
    const tvl_data = await retry(async bail => axios.get("https://api.minimax.finance/tvl/250"));
    return parseFloat(tvl_data.data.TvlTotal);
}

async function avalanche() {
    const tvl_data = await retry(async bail => axios.get("https://api.minimax.finance/tvl/43114"));
    return parseFloat(tvl_data.data.TvlTotal);
}

async function fetch() {
    const tvl_data = await retry(async bail => axios.get("https://api.minimax.finance/tvl"));
    return parseFloat(tvl_data.data.TvlTotal);
}

module.exports = {
    bsc: {
        fetch: bsc
    },
    polygon: {
        fetch: polygon
    },
    fantom: {
        fetch: fantom
    },
    avalanche: {
        fetch: avalanche
    },
    fetch
}
