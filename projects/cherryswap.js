const {fetchURL} = require('./helper/utils')

async function fetch() {
    const tvl = await fetchURL('https://www.cherryswap.net/api/tradeInfo')
    return tvl.data.tvl;
}

module.exports = {
    fetch
}
