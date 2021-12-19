const utils = require('../helper/utils');

async function fetch() {
    let tvl = await utils.fetchURL('https://api.chainport.io/tvl/get')

    return tvl.data["tvl_usd"]
}

module.exports = {
    methodology: "assets in liquidity are counted as TVL",
    fetch
}
