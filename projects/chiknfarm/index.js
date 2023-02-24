const { get } = require('../helper/http')

async function staking() {
    let response = await get('https://cdn-b.chikn.farm/api/feed/staked')
    return {
        'chikn-egg': response.totalStakedAmount
    }
}

async function tvl() {
    return {}
}

module.exports = {
    avax:{
        tvl,
        staking
    },
}
