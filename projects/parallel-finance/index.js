const retry = require("async-retry");
const axios = require("axios");
const BigNumber = require("bignumber.js");

const api = "https://auction-service-prod.parallel.fi/crowdloan/total-value";

async function fetch() {
    const resp = await retry(async (bail) => await axios.get(api));
    const ret_value = new BigNumber(resp.data.totalValue);
    return ret_value.toFixed(2);
}

module.exports = {
    fetch,
};