const utils = require('../helper/utils');

async function cardanoTVL() {
    let response = await utils.fetchURL('https://app.cherrylend.org/api/tvl')
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