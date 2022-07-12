const retry = require('async-retry')
const axios = require("axios");

async function fetch() {

    // circulating supply
    let cs = await retry(async bail => await axios.get('https://brise-bitgert.vercel.app/api/bal'))

    // price in usd
    let price = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitrise-token&vs_currencies=usd'))

    return cs.data * price;
}

module.exports = {
    fetch
}
