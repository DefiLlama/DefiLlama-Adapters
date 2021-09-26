const retry = require('async-retry');
const axios = require("axios");
const BigNumber = require("bignumber.js");



async function polygon(){

    const contract = "0xb556feD3B348634a9A010374C406824Ae93F0CF8";
    const wBan = "0xe20b9e246db5a0d21bf9209e4858bc9a3ff7a034";
    const wEth = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619";

    let banPrice = await retry(async bail => await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=banano&vs_currencies=usd"));
    let ethPrice = await retry(async bail => await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"));
    let wBanBalance = await retry(async bail => await axios.get(`https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${wBan}&address=${contract}&tag=latest&apikey=API_KEY`));
    let wEthBalance = await retry(async bail => await axios.get(`https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${wEth}&address=${contract}&tag=latest&apikey=API_KEY`));
    let wBanTotal = new BigNumber(wBanBalance.data.result).div(10 ** 18).toFixed(2) * banPrice.data.banano.usd;
    let wEthTotal = new BigNumber(wEthBalance.data.result).div(10 ** 18).toFixed(2) * ethPrice.data.ethereum.usd;

    return wBanTotal + wEthTotal;   
}

async function bsc() {
    const contract = "0x7898466CACf92dF4a4e77a3b4d0170960E43b896";
    const wBan = "0xe20b9e246db5a0d21bf9209e4858bc9a3ff7a034";
    const bUsd = "0xe9e7cea3dedca5984780bafc599bd69add087d56";

    let banPrice = await retry(async bail => await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=banano&vs_currencies=usd"));
    let bUsdPrice = await retry(async bail => await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=binance-usd&vs_currencies=usd"));
    let wBanBalance = await retry(async bail => await axios.get(`https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${wBan}&address=${contract}&tag=latest&apikey=API_KEY`))
    let bUsdBalance = await retry(async bail => await axios.get(`https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${bUsd}&address=${contract}&tag=latest&apikey=API_KEY`))
    let wBanTotal = new BigNumber(wBanBalance.data.result).div(10 ** 18).toFixed(2) * banPrice.data.banano.usd; 
    let wUsdTotal = new BigNumber(bUsdBalance.data.result).div(10 ** 18).toFixed(2) * bUsdPrice.data['binance-usd'].usd;

    return wBanTotal + wUsdTotal;

}

async function fetch() {
    return new BigNumber(await bsc()).plus(await polygon()).toFixed(2);
}

module.exports = {
    bsc: {
        fetch: bsc
    },
    polygon: {
        fetch: polygon
    },
    fetch,
    
}