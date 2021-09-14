const {fetchURL} = require('./helper/utils')
const BigNumber = require("bignumber.js");

async function fetchAll() {
    const response = await fetchURL('https://cherryswap.net/api/tvl')
    const liquidityTvl = new BigNumber(response.data.liquidityTvl)
    const poolsTvl = new BigNumber(response.data.poolsTvl)
    return liquidityTvl.plus(poolsTvl)
}

async function fetchLiquidityTvl() {
    const response = await fetchURL('https://cherryswap.net/api/tvl')
    return new BigNumber(response.data.liquidityTvl)
}

async function fetchPoolsTvl() {
    const response = await fetchURL('https://cherryswap.net/api/tvl')
    return new BigNumber(response.data.poolsTvl)
}

module.exports = {
    fetchAll,
    fetchLiquidityTvl,
    fetchPoolsTvl
}
