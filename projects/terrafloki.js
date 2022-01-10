const retry = require("./helper/retry");
const axios = require("axios");

async function pool2() {
    var res = await retry(
        async () => await axios.get("https://api.terrafloki.io/defi-llama/trade-pair-llp")
    );

    return parseFloat(res.data);
}

async function staking() {
    var res = await retry(
        async () => await axios.get("https://api.terrafloki.io/defi-llama/ticket-farming-tfloki")
    );

    return parseFloat(res.data);
}

async function tvl() {
    var res = await retry(
        async () => await axios.get("https://api.terrafloki.io/defi-llama/ticket-farming-llp")
    );

    return parseFloat(res.data);
}

module.exports = {
    pool2,
    staking,
    tvl
}; 