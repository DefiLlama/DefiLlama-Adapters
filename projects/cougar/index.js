const { fetchURL } = require('../helper/utils')
const sdk = require("@defillama/sdk");

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/

async function fetchBsc() {
    const tvl = await fetchURL('https://cougarswap.io/statistic.json')
    return tvl.data.bsc.tvl
}

async function fetchPolygon() {
    const tvl = await fetchURL('https://cougarswap.io/statistic.json')
    return tvl.data.polygon.tvl
}

async function fetchFantom() {
    const tvl = await fetchURL('https://cougarswap.io/statistic.json')
    return tvl.data.fantom.tvl
}

async function fetchHarmony() {
    const tvl = await fetchURL('https://cougarswap.io/statistic.json')
    return tvl.data.harmony.tvl
}

async function fetchAvax() {
    const tvl = await fetchURL('https://cougarswap.io/statistic.json')
    return tvl.data.avax.tvl
}

async function fetch() {
    const tvl = await fetchURL('https://cougarswap.io/statistic.json')
    return tvl.data.totalTvl;
}

module.exports = {
    bsc: {
        fetch: fetchBsc
    },
    polygon: {
        fetch: fetchPolygon
    },
    fantom: {
        fetch: fetchFantom
    },
    harmony: {
        fetch: fetchHarmony
    },
    avax: {
        fetch: fetchAvax
    },
    fetch
}
