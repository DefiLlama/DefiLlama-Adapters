const { get } = require('../helper/http')

async function bsc() {
    const tvl_data = await get("https://api.minimax.finance/tvl/56");
    return parseFloat(tvl_data.TvlTotal);
}

async function polygon() {
    const tvl_data = await get("https://api.minimax.finance/tvl/137");
    return parseFloat(tvl_data.TvlTotal);
}

async function fantom() {
    const tvl_data = await get("https://api.minimax.finance/tvl/250");
    return parseFloat(tvl_data.TvlTotal);
}

async function avalanche() {
    const tvl_data = await get("https://api.minimax.finance/tvl/43114");
    return parseFloat(tvl_data.TvlTotal);
}

async function arbitrum() {
    const tvl_data = await get("https://api.minimax.finance/tvl/42161");
    return parseFloat(tvl_data.TvlTotal);
}

async function aurora() {
    const tvl_data = await get("https://api.minimax.finance/tvl/1313161554");
    return parseFloat(tvl_data.TvlTotal);
}

async function moonbeam() {
    const tvl_data = await get("https://api.minimax.finance/tvl/1284");
    return parseFloat(tvl_data.TvlTotal);
}


async function fetch() {
    const tvl_data = await get("https://api.minimax.finance/tvl");
    return parseFloat(tvl_data.TvlTotal);
}

module.exports = {
    methodology: 'We store all user positions in our database, which is built using the blockchain data (it helps us fetch read data fast for our website). TVL is just a sum of all open positions in $ equivalent.',
    bsc: {
        fetch: bsc
    },
    polygon: {
        fetch: polygon
    },
    fantom: {
        fetch: fantom
    },
    avax:{
        fetch: avalanche
    },
    arbitrum: {
        fetch: arbitrum
    },
    aurora: {
        fetch: aurora
    },
    moonbeam: {
        fetch: moonbeam
    },
    fetch
}
