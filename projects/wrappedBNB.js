const { get } = require('./helper/http')

async function tvl() {
    const totals = (await get('https://api.kava.io/bank/total')).result.supply;
    const bnb = (totals.filter(a => a.denom == 'bnb'))[0];
    const supply = bnb.amount / 10 ** 8;
    return { 'binancecoin': supply };
};

module.exports = {
    timetravel: false,
    bsc: { tvl }
};