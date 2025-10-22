const { get } = require('../helper/http')

async function tvl(api) {

    const endpoint = 'http://api.ociswap.com/statistics/pool-types';
    const options = {
        headers: {
            'accept': 'application/json'
        }
    };

    const statistics = await get(endpoint, options)

    const precisionIndex = statistics.findIndex(pool => pool.pool_type === 'precision')

    return {
        'radix': statistics[precisionIndex].total_value_locked.xrd.now
    }
}

module.exports = {
    timetravel: false,
    radixdlt: { tvl }
}
