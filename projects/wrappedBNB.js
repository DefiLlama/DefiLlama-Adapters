const retry = require('./helper/retry')
const axios = require("axios");

async function tvl() {
    const totals = (await retry(async bail => 
        await axios.get('https://api.kava.io/supply/total'))).data.result;
    const bnb = (totals.filter(a => a.denom == 'bnb'))[0];
    const supply = bnb.amount / 10 ** 8;
    return { 'binancecoin': supply };
};

module.exports = {
    tvl
};