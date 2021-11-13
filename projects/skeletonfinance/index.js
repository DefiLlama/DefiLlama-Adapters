const utils = require('../helper/utils');

async function fantom() {
    const response = await utils.fetchURL('https://skeleton.finance/static/frontend/jsonfiles/fantom-yield.json');
    const pools = response.data.pools;

    let tvl = 0;
    for (pool_id in pools) {
        tvl += Number(pools[pool_id]['tvl']);
    }
    if(tvl === 0){
        throw new Error(`Fantom tvl is 0`)
    }

    return tvl
}

async function fetch() {
    return (await fantom())
}

module.exports = {
    fantom:{
        fetch: fantom
    },
    fetch
}
