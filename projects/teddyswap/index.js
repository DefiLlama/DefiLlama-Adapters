const { getAdaInAddress } = require("../helper/chain/cardano");

const POOL_VALIDATOR_HASH = 'script19zaaraawhvaut8snt9lnxwhwlw844duwm2tzmcwkqkecs3njjz6';

async function cardanoTVL() {
    return {
        cardano: await getAdaInAddress(POOL_VALIDATOR_HASH) * 2
    };
}

module.exports = {
    timetravel: false,
    cardano: {
        tvl: cardanoTVL
    }
}