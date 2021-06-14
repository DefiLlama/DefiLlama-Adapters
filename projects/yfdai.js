const retry = require('./helper/retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetch() {
    let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=yfdai-finance&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
    const jsondata = await JSON.stringify(price_feed.data["yfdai-finance"].usd);
    let response = await retry(async bail => await axios.get('https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=0xf4CD3d3Fda8d7Fd6C5a500203e38640A70Bf9577&apikey=H6NGIGG7N74TUH8K2X31J1KB65HFBH2E82'))
    let tvl = new BigNumber(response.data.result).div(10 ** 8).toFixed(2);
    return (tvl * jsondata);
}

module.exports = {
    fetch
}