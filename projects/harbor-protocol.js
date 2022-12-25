const utils = require('./helper/utils')

async function fetch() {
    const response = await utils.fetchURL("https://rest.comdex.one/comdex/vault/v1beta1/tvl-by-app/2")
    return response.data.collateral_locked/Math.pow(10,6);
}

module.exports = {
    fetch
}