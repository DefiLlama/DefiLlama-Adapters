const { queryContract, } = require('./helper/chain/cosmos')

async function getMarkets() {
    const res = await queryContract({ contract: 'terra1pcxwtrxppj9xj7pq3k95wm2zztfr9kwfkcgq0w', data: { market_lists: {} }, chain: 'terra' })
    return res
}
async function tvl(_, _1, _2, { api }) {
    const markets = await getMarkets()
    markets.forEach(m => {
        api.add(m.underlying, Math.floor(m.total_credit - m.total_insurance))
    });
}

async function borrowed(_, _1, _2, { api }) {
    const markets = await getMarkets()
    markets.forEach(m => {
        api.add(m.underlying, Math.floor(m.total_loan))
    });
}

module.exports = {
    timetravel: false,
    methodology: `We query Edge's Genesis Pool smart contracts to get the amount of assets deposited and borrowed, we then use Coingecko to price the assets in USD.`,
    terra: {
        tvl,
        borrowed
    },
    hallmarks: [
        [1651881600, "UST depeg"],
    ]
};
