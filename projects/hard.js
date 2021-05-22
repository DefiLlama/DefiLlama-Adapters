const retry = require('./helper/retry')
const axios = require("axios");

const KAVA_DENOM = "ukava";
const HARD_DENOM = "hard";
const USDX_DENOM = "usdx";
const BNB_DENOM = "bnb";
const BTC_DENOM = "btcb";
const BUSD_DENOM = "busd";
const XRPB_DENOM = "xrpb";


var getPrices = async () => {
    var prices = [];

    const usdxPrice = {name: USDX_DENOM, price: 1};
    prices.push(usdxPrice);

    const hardPrice = {name: HARD_DENOM, price: 0};
    prices.push(hardPrice);

    const busdPrice = {name: BUSD_DENOM, price: 1};
    prices.push(busdPrice);

    const kavaMarketResponse = await retry(async bail => await axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=KAVAUSDT'))


    const kavaMarketData = kavaMarketResponse.data;
    const kavaPrice = {name: KAVA_DENOM, price: Number(kavaMarketData.lastPrice)};
    prices.push(kavaPrice);

    const bnbMarketResponse = await retry(async bail => await axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=BNBUSDT'))

    const bnbMarketData = bnbMarketResponse.data;
    const bnbPrice = {name: BNB_DENOM, price: Number(bnbMarketData.lastPrice)};
    prices.push(bnbPrice);

    const btcMarketResponse = await retry(async bail => await axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'))
    const btcMarketData = btcMarketResponse.data;
    const btcPrice = {name: BTC_DENOM, price: Number(btcMarketData.lastPrice)};
    prices.push(btcPrice);

    const xrpMarketResponse = await retry(async bail => await axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=XRPUSDT'))
    const xrpMarketData = xrpMarketResponse.data;
    const xrpPrice = {name: XRPB_DENOM, price: Number(xrpMarketData.lastPrice)};
    prices.push(xrpPrice);

    return prices;
}

var getTotalValues = async (prices) => {
    var conversionMap = new Map();
    conversionMap.set(USDX_DENOM, 10 ** 6);
    conversionMap.set(KAVA_DENOM, 10 ** 6);
    conversionMap.set(HARD_DENOM, 10 ** 6);
    conversionMap.set(BNB_DENOM, 10 ** 8);
    conversionMap.set(BTC_DENOM, 10 ** 8);
    conversionMap.set(BUSD_DENOM, 10 ** 8);
    conversionMap.set(XRPB_DENOM, 10 ** 8);


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
            //console.log(coin.denom, value);
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
