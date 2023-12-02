const utils = require('../helper/utils');

async function cardanoTVL() {
    let response = await utils.fetchURL('https://analytics.teddyswap.org/v1/pools/overview?after=0')
    let data = response.data;

    let totalTvl = 0;
    for (let i = 0; i < data.length; i++) {
        totalTvl += data[i].tvl;
    }

    return { cardano: totalTvl };
}

module.exports = {
    timetravel: false,
    cardano: {
        tvl: cardanoTVL
    }
}