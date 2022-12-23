
const { get, } = require('../helper/http')

const blacklistedAssets = ['uaxl']
async function fetch() {
    var { data } = await get('https://api.axelarscan.io/cross-chain/tvl')

    var tvl = 0;
    for (const asset of data) {
        if (blacklistedAssets.includes(asset.asset))    continue;
        tvl += asset.value
    }
    return tvl
}

module.exports = {
    fetch
}
