const utils = require('./helper/utils')

async function fetch() {
    let dpiAddress = "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b"
    return (await utils.getTokenPricesFromString(dpiAddress)).data[dpiAddress].usd_market_cap
}

module.exports = {
    fetch
}
