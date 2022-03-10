const retry = require('async-retry')
const axios = require("axios");

async function staking() {
    let response = await retry(async bail => await axios.get('https://cdn-b.chikn.farm/api/feed/staked'))
    return {
        'chikn-egg': response.data.totalStakedAmount
    }
}

async function tvl() {
    return {}
}

module.exports = {
    avalanche:{
        tvl,
        staking
    },
}
