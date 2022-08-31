const { toUSDTBalances } = require('../helper/balances')
const utils = require("../helper/utils");

const COINS_LIST = `dai,bitcoin,ethereum,wrapped-bitcoin,frax,usd-coin,tether,fei-usd,true-usd,maker`;

function format(pools) {
    return pools.map((pool) => {
        return pool.output;
    })
}

async function getPricesfromString() {
    return utils.getPricesfromString(COINS_LIST)
}

module.exports = {
    toUSDTBalances,
    format,
    getPricesfromString
};
