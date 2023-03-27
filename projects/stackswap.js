const { get } = require('./helper/http')

async function fetch() {
    let poolValues = (
        await get("https://app.stackswap.org/api/v1/pools")
            )
            .filter(p => p.pair_name !== 'STSW-lBTC')
            .map(p => p.liquidity_locked);
    poolValues = poolValues.map(v => v.substring(0, v.indexOf('USD')));
    return poolValues.reduce((a, b) => a + parseFloat(b), 0);
}

module.exports = {
    timetravel: false,
    fetch,
};
