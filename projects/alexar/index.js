
const { get, } = require('../helper/http')

async function fetch() {
    var { data } = await get('https://api.axelarscan.io/cross-chain/tvl')

    var tvl = 0;
    for (const asset of data) {
        tvl += asset.value
    }
    return tvl
}

module.exports = {
    fetch
}
