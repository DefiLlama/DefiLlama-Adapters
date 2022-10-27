const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetch() {
    var res = await retry(async bail => await axios.get('https://api.axelarscan.io/cross-chain/tvl'))

    var tvl = 0;
    for (const asset of res.data.data) {
        tvl = tvl + (parseFloat(asset.total)) * (parseFloat(asset.price))
    }
    return new BigNumber(tvl);
}

module.exports = {
    fetch
}