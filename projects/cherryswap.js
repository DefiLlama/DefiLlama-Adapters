const {fetchURL} = require('./helper/utils')
const BigNumber = require("bignumber.js");
async function fetch() {
    const response = await fetchURL('https://cherryswap.net/api/tvl')
    const liquidityTvl = new BigNumber(response.data.liquidityTvl)
    const poolsTvl = new BigNumber(response.data.poolsTvl)
    return liquidityTvl.plus(poolsTvl)
}

module.exports = {
    fetch
}
