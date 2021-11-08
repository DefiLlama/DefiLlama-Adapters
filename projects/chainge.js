const utils = require('./helper/utils');

// fusion
async function fetch() {
    let tvl = await utils.fetchURL('https://info.chainge.finance/api/v1/info/getInfoOuterTvl')

    return tvl.data.data.totalTvl
}

module.exports = {
    fetch
}
