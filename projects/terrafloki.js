const retry = require("./helper/retry");
const axios = require("axios");
const {toUSDTBalances} = require('./helper/balances')

async function pool2() {
    var res = await retry(
        async () => await axios.get("https://api.terrafloki.io/defi-llama/trade-pair-llp")
    );

    return toUSDTBalances(parseFloat(res.data));
}

async function staking() {
    var res = await retry(
        async () => await axios.get("https://api.terrafloki.io/defi-llama/ticket-farming-tfloki")
    );

    return toUSDTBalances(parseFloat(res.data));
}

async function tvl() {
    var res = await retry(
        async () => await axios.get("https://api.terrafloki.io/defi-llama/ticket-farming-llp")
    );

    return toUSDTBalances(parseFloat(res.data));
}

module.exports = {
    terra:{        
        pool2,
        staking,
        tvl

    }
    
}; 