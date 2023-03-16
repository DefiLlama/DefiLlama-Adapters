const utils = require('./helper/utils')

async function fetch(){
    const tvl = await utils.fetchURL("https://public.nerve.network/nerve/tvl")
    return Number(tvl.data.totalUsdTvl)
}

module.exports = {
    nuls: {
        fetch
    },
    fetch
}