const utils = require('./helper/utils');

async function farmingTvl() {
    var totalTvl = await utils.fetchURL('https://swap-api.starcoin.org/main/v1/farmingTvlInUsd');
    return totalTvl.data;
}

async function stakeTvl() {
    const totalTvl = await utils.fetchURL('https://swap-api.starcoin.org/main/v1/syrupPoolTvlInUsd')
    return totalTvl.data;
}

async function fetch() {
    return (await farmingTvl())+(await stakeTvl())
}

module.exports = {
    methodology: `StarSwap's TVL is achieved by making a call to it's API: https://swap-api.starcoin.org/main/v1/farmingTvlInUsd (Farming) and https://swap-api.starcoin.org/main/v1/syrupPoolTvlInUsd (Stake).`,
    doublecounted: false,
    timetravel: false,
    incentivized: true,
    starcoin: {
        tvl: fetch,
        farming: farmingTvl,
        staking: stakeTvl
    },
}