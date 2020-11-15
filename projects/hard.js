const retry = require('async-retry')
const axios = require("axios");

const KAVA_DENOM = "ukava";
const HARD_DENOM = "hard";
const USDX_DENOM = "usdx";
const BNB_DENOM = "bnb";


var getPrices = async () => {
    var prices = [];

    const usdxPrice = {name: USDX_DENOM, price: 1};
    prices.push(usdxPrice);

    const hardPrice = {name: HARD_DENOM, price: 0};
    prices.push(hardPrice);


    const kavaMarketResponse = await retry(async bail => await axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=KAVAUSDT'))


    const kavaMarketData = kavaMarketResponse.data;
    const kavaPrice = {name: KAVA_DENOM, price: Number(kavaMarketData.lastPrice)};
    prices.push(kavaPrice);

    const bnbMarketResponse = await retry(async bail => await axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=BNBUSDT'))

    const bnbMarketData = bnbMarketResponse.data;
    const bnbPrice = {name: BNB_DENOM, price: Number(bnbMarketData.lastPrice)};
    prices.push(bnbPrice);

    return prices;
}

var getTotalValues = async (prices) => {
    var conversionMap = new Map();
    conversionMap.set(USDX_DENOM, 10 ** 6);
    conversionMap.set(KAVA_DENOM, 10 ** 6);
    conversionMap.set(HARD_DENOM, 10 ** 6);
    conversionMap.set(BNB_DENOM, 10 ** 8);


    const response = await retry(async bail => await axios.get('https://kava4.data.kava.io/harvest/accounts'))
    const data = response.data;
    const results = data && data.result;

    var totalValues = [];
    if(results && results.length > 0) {
        const harvestAccAddress = "kava16zr7aqvk473073s6a5jgaxus6hx2vn5laum9s3"
        const harvestAcc =  results.find((item) => item.value.address === harvestAccAddress);
        const coins = harvestAcc.value.coins;
        for(coin of coins) {
            const supply = Number(coin.amount)/conversionMap.get(coin.denom);
            const price = prices.find((item) => item.name === coin.denom).price;
            const value = supply * Number(price);
            totalValues.push({denom: coin.denom, total_value: value});
        }
    }
    return totalValues
}

var fetch = async () => {
    const prices = await getPrices();
    const totalValues = await getTotalValues(prices);
    var tvl = 0;
    for(asset of totalValues) {
        tvl += asset.total_value
    }
    return tvl;

}




module.exports = {
  fetch
}
