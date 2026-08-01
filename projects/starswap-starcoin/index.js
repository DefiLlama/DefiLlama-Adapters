const { get } = require('../helper/http')

async function tvl() {
    const tvl = await get('https://swap-api.starcoin.org/main/v1/farmingTvlInUsd')
    return {
        tether: tvl
    }
}

async function staking() {
    const totalTvl = await get('https://swap-api.starcoin.org/main/v1/syrupPoolTvlInUsd')
    return {
        tether: totalTvl,
    };
}

module.exports = {
    methodology: `Starswap's TVL is achieved by making a call to it's API: https://swap-api.starcoin.org/main/v1/farmingTvlInUsd (Farming) and https://swap-api.starcoin.org/main/v1/syrupPoolTvlInUsd (Stake).`,
    misrepresentedTokens: true,
    timetravel: false,
    starcoin: {
        tvl,
        staking,
     },
}